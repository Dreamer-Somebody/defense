jQuery(document).ready(function($) {
    $like_button = $("#like-button");
    $article_id = $("input[name='article_id']").val();
    $count = $("#likes-count");
    (function get_sidebar() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_sidebar'
            },
            success: function(data) {
                $("body").prepend(data);
            }
        });

    })();
    (function add_click() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'add_click',
                article_id: $article_id
            }
        });
    })();
    (function get_likes_count() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_likes_count',
                article_id: $article_id
            },
            success: function(data) {
                $count.html(data);
            },
            error: function() {
                $count.html("获取失败");
            }
        });
    })();
    (function get_random_avatar() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_random_avatar',
                article_id: $article_id
            },
            success: function(data) {
                $("#photo").attr('src', data);
                $("input[name='pic']").val(data);
            }
        });

    })();
    (function get_article_list() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_article_list',
                article_id: $article_id
            },
            success: function(data) {
                $("#list").append(data);
            },
            error: function() {
                $("#list").append("获取数据失败，请刷新页面。");
            }
        });
    })();

    $window_height = window.screen.availHeight;
    $(window).on('scroll', function(event) {
        if (timeout) {
            clearTimeout(timeout);
        }
        var timeout = setTimeout(function() {
            event.preventDefault();
            if ($(window).scrollTop() > $window_height) {
                $("#toTop").css('opacity', '1');
            } else {
                $("#toTop").css('opacity', '0');
            }
        }, 50);

    });

    $("body").append("<div id='toTop'><i class='icon-fold'></i></div>");
    $("body").on('click', '#toTop', function(event) {
        event.preventDefault();
        $("body,html").animate({ scrollTop: 0 }, 500);
    });

    $like_button.on('click', function(event) {
        event.preventDefault();
        $thanks = $("#thanks");
        if ($thanks.attr('fav') == 1) {
            $thanks.html("(*￣3￣)╭你已经支持过啦，</br>不能重复支持哦。。。");
            move($thanks);
            return;
        }

        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'like',
                article_id: $article_id
            },
            error: function() {
                $thanks.html("(╥╯^╰╥)点赞失败，，，</br>请重试。。。");
                move($thanks);
            },
            success: function(msg) {
                if (msg == "true") {
                    $number = parseInt($("#likes-count").text()) + 1;
                    $("#likes-count").text($number);
                    $thanks.attr('fav', 1).html("=￣ω￣=感谢您的支持，</br>我会继续努力的！");
                } else {
                    $thanks.html("(╥╯^╰╥)点赞失败，，，</br>请重试。。。");
                }
                move($thanks);
            }
        });
    });


    $("#list_nav li").on('click', function(event) {
        event.preventDefault();
        $this = $(this);
        $this.parent().find('li').removeClass('now');
        $class = $this.attr('class');
        $this.addClass('now');
        $(".sublist").removeClass('show');
        $('ul.' + $class).addClass('show');
    });

    $("#face").on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $("#emoji_list").toggleClass('display');
    });

    $(".emoji").on('click', function(event) {
        event.preventDefault();
        $emoji = $(this).data('emoji');
        $("textarea").val($("textarea").val() + "[:" + $emoji + ":]");
        $("textarea").focus();
    });

    $("body").on('click', function(event) {
        $("#emoji_list").removeClass('display');
    });

    //获取评论并展示开始

    (function get_comment() {
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_comment',
                article_id: $article_id
            },
            success: function(data) {
                //解析JSON时，数据被正序排序好了。
                var arr = JSON.parse(data);
                var obj = [];

                //获取arr对象数组的所有键名，然后倒序，这是为了实现评论按照最新最先的排序方式。
                obj = Object.keys(arr).reverse();
                var html = make_comment(arr, obj);
                $("#comment_list").append(html);
            }
        });
    })();
    var html = '';

    function make_comment(arr, obj) {
        for (var index in obj) {
            make_up(arr, obj[index]);
        }
        return html;
    }

    function getTotalFloor(obj) {
        var length = 0;
        for (var index in obj) {
            if (obj[index].parent === '' || obj[index].parent === null) {
                length++;
            }
        }
        return length;
    }
    var start = false;
    var tag = [];
    var floor = 0;

    function make_up(obj, index) {
        var now = obj[index];
        var length = getTotalFloor(obj);
        if ((tag[now.comment_id] != 1) && ((now.parent === null) || (now.parent === '') || (now.parent !== null && now.parent !== '' &&
                tag[obj[now.parent].comment_id] == 1))) {
            html += "<div class='user_comment " + (now.parent !== null && now.parent !== '' ? 'children' : '') +
                "'id='comment" + now.comment_id + "' name='comment"+now.comment_id+"'>";
            html += "<div class='pic'>";
            html += "<img src='" + now.user_pic + "' name='avatar' /></div>";
            html += "<div class='wrapper'><span>" + now.user_name + "</span>";
            if (now.content.indexOf("&lt;author==true&gt;") >= 0) {
                html += "<span class='author'>博主</span>";
                now.content = now.content.replace("&lt;author==true&gt;", "");
            }
            now.content = now.content.replace(/@@@(\d+)-([^@]+)@@/g, "<a href='#comment" + "$1" + "'><span>@" + "$2" + "</span></a>");
            now.content = now.content.replace(/\[:(\w+):\]/g, "<img class='emoji' src='/blog/img/emoji/$1.png'/>");
            html += "<span class='time'>" + now.pub_time + "</span>";
            html += "<p class='comment_content'>" + now.content + "</p></div>";
            html += "<div class='comment_actions'><a href='#comment_form' class='call' data-id='" +
                now.comment_id + "' data-user='" + now.user_name + "'>@TA</a><a href='#comment_form' class='reply' data-id='" + now.comment_id +
                "' data-user='" + now.user_name + "' data-parent='" + (now.parent === null || now.parent === '' ? now.comment_id : now.parent) +
                "'><i class='icon-undo'></i>回复</a></div>";
            if (now.parent === null || now.parent === '') {
                html += "<div class='comment_actions show'><p>" + (length - floor) + "#</p></div>";
                floor += 1;
            }
            html += "</div>";
            start = true;
            tag[now.comment_id] = 1;

            if (now.children !== null && now.children !== '') {
                now.children = $.trim(now.children);
                var arr = now.children.split(",");
                for (var i = 0; i <= arr.length - 2; i++) {
                    arguments.callee(obj, arr[i]);
                }
            }
        }
        return html;
    }


    //获取评论并展示结束
    $("#nickname").on('focus', function(event) {
        move($("#tips"));
    });

    function move($obj) {
        event.preventDefault();
        $obj.addClass("move");
        setTimeout(function() {
            $obj.removeClass("move");
        }, 2500);
    }
    $("body").on('submit', 'form', function(event) {
        event.preventDefault();
        if (!check()) {
            return false;
        }
        if (is_author()) {
            $("textarea").val("<author==true>" + $("textarea").val());
        }
        if ($("#comment_html").val() !== 'undefined' && $("#comment_html").val() !== '') {
            $string = $("textarea").val();
            $("#comment_html").val(replace_word($string, $("#comment_html").val()));
        }
        $.ajax({
            type: "POST",
            url: '/blog/admin/control.php?action=insert_comment',
            data: $('form').serialize(),
            error: function(request) {
                show("<i class='icon-cancel'></i>连接服务器失败");
            },
            success: function(comment_id) {
                var html = '';
                var $content_type = ($article_id != '0' ? "评论" : "留言");
                if (comment_id !== "false") {
                    $("#result").addClass("success");
                    html = "<i class='icon-check_circle'></i>" + $content_type + "成功！";
                    insert(comment_id);
                    $("textarea").val('');
                    $("#comment_html").val('');
                    $("#comment_parent").val('');

                } else {
                    html = "<i class='icon-cancel'></i>" + $content_type + "失败！请重试。";
                }
                show(html);
            }
        });
    });

    //由于“@TA”和“回复”都是动态生成的节点，直接绑定事件不能成功，必须使用事件委托。
    $("body").on('click', '.call', function(event) {
        event.preventDefault();
        id = this.dataset.id;
        user = this.dataset.user;
        $("textarea").focus();
        $("textarea").val($('textarea').val() + "@" + user);
        $value = (typeof $('#comment_html').val() === 'undefined' || $('#comment_html').val() === '') ? '' : ($('#comment_html').val() + ',');
        $("#comment_html").val($value + "@" + user + "&@@@" + id + "-" + user + "@@");
    });

    $("body").on('click', '.reply', function(event) {
        event.preventDefault();
        id = this.dataset.id;
        user = this.dataset.user;
        parent = this.dataset.parent;
        $("#comment_parent").val(parent);
        $("textarea").focus();
        $("textarea").val("回复@" + user + "：");
        $("#comment_html").val("回复@" + user + "&回复@@@" + id + "-" + user + "@@");
    });

    $("body").on('mouseover', '.user_comment', function(event) {
        event.preventDefault();
        $(this).find(".comment_actions").toggleClass('show');
    }).on('mouseout', '.user_comment', function(event) {
        event.preventDefault();
        $(this).find(".comment_actions").toggleClass('show');
    });

    function check() {
        var $name = $("#nickname").val();
        var $content = $("textarea").val();
        var $content_type = ($article_id != '0' ? "评论" : "留言");
        var $wrong = ($name === '' ? "昵称不能为空！" : '') + ($content === '' ? $content_type + "不能为空！" : '');
        if ($wrong !== '') {
            show("<i class='icon-cancel'></i>" + $wrong);
            return false;
        }
        return true;
    }

    function show(html) {
        clearTimeout(show);
        $("#result").html(html);
        $("#result").addClass('show');
        var show = setTimeout(function() {
            $("#result").attr('class', '');
        }, 3000);
    }

    function is_author() {
        return document.cookie.indexOf("author=true") >= 0;
    }

    function escapeHTML(a) {
        return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;").replace(/"/g, "&#34;").replace(/'/g, "&#39;");
    }

    function insert(comment_id) {
        var obj = {};
        var date = new Date();
        var $parent = $("input[name='comment_parent']").val();
        var $user_pic = $("input[name='pic']").val();
        var $user_name = $("input[name='nickname']").val();
        var pub_time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var $content = $("#comment_html").val() === (null || '') ? $("textarea").val() : $("#comment_html").val();
        var html = '';
        html += "<div class='user_comment " + ($parent !== null && $parent !== '' ? 'children' : '') +
            "'id='comment" + comment_id + "'>";
        html += "<div class='pic'>";
        html += "<img src='" + $user_pic + "' name='avatar' /></div>";
        html += "<div class='wrapper'><span>" + $user_name + "</span>";
        if (is_author()) {
            html += "<span class='author'>作者</span>";
            $content = $content.replace("<author==true>", "");
        }
        html += "<span class='time'>" + pub_time + "</span>";
        $content = escapeHTML($content);
        $content = $content.replace(/@@@(\d+)-([^@]+)@@/g, "<a href='#comment" + "$1" + "'><span>@" + "$2" + "</span></a>");
        $content = $content.replace(/\[:(\w+):\]/g, "<img class='emoji' src='/blog/img/emoji/$1.png'/>");
        html += "<p class='comment_content'>" + $content + "</p></div>";
        html += "<div class='comment_actions'><a href='#comment_form' class='call' data-id='" +
            comment_id + "' data-user='" + $user_name + "'>@TA</a><a href='#comment_form' class='reply' data-id='" + comment_id +
            "' data-user='" + $user_name + "' data-parent='" + ($parent === null || $parent === '' ? comment_id : $parent) + "'>回复</a></div>";
        html += "</div>";
        var $lastChild = $("a[data-parent='" + $parent + "']:last");
        $parent = ".user_comment#comment" + $("input[name='comment_parent']").val();
        var $pos = $lastChild.length === 0 ? ($($parent).length === 0) ? $("#comment_list") : $($parent) : $lastChild.parent().parent();
        if ($pos.attr('id') == 'comment_list') {
            $pos.prepend(html);
        } else {
            $pos.after(html);
        }
    }

    function replace_word($string, $replacement) {
        var $arr = $replacement.split(",");
        var $replace = [];
        var len = $arr.length;
        for (i = 0; i < len; i++) {
            $replace[i] = [];
            for (j = 0; j < 2; j++) {
                $replace[i][j] = $arr[i].split("&")[j];
            }
        }
        for (var $key in $replace) {
            $string = $string.replace($replace[$key][0], $replace[$key][1]);
        }
        return $string;
    }
    $("form .pic").on('click', function(event) {
        event.preventDefault();
        $("#big_mask").addClass('show');
        $("#choose").addClass('zoom');
        $.ajax({
            url: '/blog/admin/control.php',
            data: {
                action: 'get_avatar'
            },
            success: function(data) {
                $("#avatar_pics").html(data);
            },
        });
    });
    $("#big_mask,#cancel").on('click', function(event) {
        event.preventDefault();
        $("#big_mask").removeClass('show');
        $("#choose").removeClass('zoom');
    });
    $("body").on('click', '#choices img', function(event) {
        event.preventDefault();
        $("#choices img").removeClass('selected');
        $(this).addClass('selected');
    });
    $("body").on('click', '#true', function(event) {
        event.preventDefault();
        $("#photo").attr('src', $(".selected").attr('src'));
        $("input[name='pic']").val($(".selected").attr('src'));
        $("#big_mask").removeClass('show');
        $("#choose").removeClass('zoom');
    });
});
