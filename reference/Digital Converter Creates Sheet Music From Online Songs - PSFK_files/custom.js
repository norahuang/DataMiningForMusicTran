// custom UI and animations

function getHashFilter() {
    var hash = location.hash;
    // get #filterName
    var matches = location.hash.match( /#([^&]+)/i );
    var hashFilter = matches && matches[1];
    return hashFilter && decodeURIComponent( hashFilter );
}
jQuery(document).ready(function ($) {

    if (jQuery(".report-grid").length > 0) {
        var $grid = jQuery('.report-grid').isotope({
            itemSelector: '.report-grid-item',
            layoutMode: 'fitRows'
        });
        jQuery("body").on("click", ".filter-button", function () {
            var filterValue = jQuery( this ).attr('data-filter');
            location.hash = encodeURIComponent( filterValue );
            return false;
        });

        var isIsotopeInit = false;

        function onHashchange() {
            var hashFilter = getHashFilter();
            var hashFilterSelector = '';
            if ( !hashFilter && isIsotopeInit ) {
                return;
            }
            if (hashFilter) {
                hashFilterSelector = hashFilter;
                hashFilter = '.'+hashFilter;
            }
            isIsotopeInit = true;
            // filter isotope
            $grid.isotope({
                itemSelector: '.report-grid-item',
                filter: hashFilter
            });
            // set selected class on button
            if ( hashFilterSelector ) {
                jQuery('.filter-button-list li.active').removeClass('active');
                jQuery('[data-filter="' + hashFilterSelector + '"]').parent('li').addClass('active');
            }
        }

        jQuery(window).on( 'hashchange', onHashchange );
        // trigger event handler to init Isotope
        onHashchange();
    }

    $("body").on("click", ".sub-topics-title-close", function(){
        $("li.menu-item-has-children").removeClass("active");
        $(".side-menu").removeClass("noscroll");
    });
    $("body").on("click", ".menu-item-has-children .main-menu-link", function(){
        var el_href = $(this).attr("href");
        if (typeof el_href != "undefined" && typeof el_href != "null" && el_href != ''){
            el_href = el_href.trim();
            if (el_href.charAt(0) == '#') {
                $("li.menu-item-has-children").removeClass("active");
                $(".side-menu").removeClass("noscroll");
                $(this).parent("li.menu-item-has-children").addClass("active");
                $(".side-menu").scrollTop(0).addClass("noscroll");
                return false;
            }
        }
    });
    if ($(".menu-hamburger-menu-container .menu-item-has-children").length > 0) {
        $("body").on("click", function(e){
            if($(e.target).closest("ul.sub-menu").length == 0) {
                $("li.menu-item-has-children").removeClass("active");
                $(".side-menu").removeClass("noscroll");
            }
        });
    }
    $("body").on("click", ".pulse-expand", function(){
        var pulse_excerpt = $(this).next().next(".pulse-excerpt");
        if (typeof pulse_excerpt != "undefined" && typeof pulse_excerpt != "null" && pulse_excerpt !== false){
            $(this).next(".pulse-arrow").toggleClass("active");
            pulse_excerpt.slideToggle();
        }
        return false;
    });
    $("body").on("click", ".pulse-arrow", function(){
        $(this).toggleClass("active");
        var pulse_excerpt = $(this).next(".pulse-excerpt");
        if (typeof pulse_excerpt != "undefined" && typeof pulse_excerpt != "null" && pulse_excerpt !== false){
            pulse_excerpt.slideToggle();
        }
        return false;
    });


    jQuery("body").on("mouseover", ".customtooltip", function(e){
        var selector = jQuery(this).data('id')
        var left_pos = jQuery(this).parent('div').parent('li').position().left +
            jQuery(this).parent('div').position().left +
            jQuery(this).position().left -
            jQuery("#"+selector).outerWidth();
        jQuery("#"+selector).css({
            'opacity': 1,
            'display': 'block',
            'left': left_pos+'px'
        })
    });
    jQuery("body").on("mouseout", ".customtooltip", function(e){
        var selector = jQuery(this).data('id')
        jQuery("#"+selector).css({
            'opacity': 0,
            'display': 'none'
        })
    });


    if ($('[data-toggle="tooltip"]').length > 0){
        $('[data-toggle="tooltip"]').tooltip({
            delay: { "show": 0, "hide": 0 }
        })
        $(document).on("touchstart", function(evt){
            if($(evt.target).closest('[data-toggle="tooltip"]').length == 0){
                $('[data-toggle="tooltip"]').tooltip('hide');
            }
        });
        $('[data-toggle="tooltip"]').on("click", function(){
            $(this).tooltip('show')
        });
    }

    // addthis code sharing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (typeof addthis !== "undefined" && typeof addthis !== "null"){
        function addthisReady(evt) {
            $(".custom_images .addthis_button_email span").parent("a").remove();
        }

        // Listen for the ready event
        addthis.addEventListener('addthis.ready', addthisReady);
    }
    // addthis code sharing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    $(".tap-scroll-top").on("click", function(){
        $("body").animate({scrollTop:0}, '300', 'swing');
    });

    $(".content-block").focus();

    // video blocks start
    videoPlayPrepare();
    $("body").on("click", ".video-jq .video-visible", function(){
        videoPlayStart($(this));
    });
    $(".content-block").scroll(function() {
        if ($(".video-jq .play-on").length > 0) {
            $(".video-jq .play-on").each(function(){
                var top = $(this).offset().top;
                var wHeight = $(".content-block").innerHeight();
                if (
                    (top<0 && top + wHeight < 0) ||
                    (top>0 && top > wHeight*2.5)
                ){
                    videoPlayStop($(this));
                }
            });
        }
    });
    // video block end



    $(".top-nav .menu-lnk, .top-page-header .topics-expand, .top-page-header .topic-expand-mobile").on('click', function(e){
        e.preventDefault();
        if ($(".side-menu").hasClass('active')) {
            ga('send', 'event', 'Nav Bar', 'Close', 'Menu');
        } else {
            ga('send', 'event', 'Nav Bar', 'Open', 'Menu');
        }
        $(".side-menu, .top-page-header .topics-expand, .topic-expand-mobile").toggleClass("active");
        //if($(".top-page-header .topics-expand").hasClass('active')) {
        //    $(".top-page-header .topics-expand").text("CLOSE  X");
        //} else {
        //    $(".top-page-header .topics-expand").text("TOPICS");
        //}
        $(".side-menu .close-btn").removeClass("active")
    });

    $(".main-menu-item a.menu-link, .top-page-header .topics-expand").on('click', function(){
        if ($(this).text().length > 0) {
            ga('send', 'event', 'Nav Bar', 'Click', $(this).text());
        }
    });


    // in Tab
    $("body").on("click", ".tab-content .form-wrapper .socials-list .facebook", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Facebook');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .twitter", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Twitter');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .google", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Google+');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .linkedin", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'LinkedIn');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .instagram", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Instagram');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .vimeo", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Vimeo');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .youtube", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Youtube');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .pinterest", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'Pinterest');
    });
    $("body").on("click", ".tab-content .form-wrapper .socials-list .rss", function(){
        ga('send', 'event', 'Articles Nav', 'Click', 'RSS');
    });
    $("body").on("focus", ".tab-content .form-wrapper input[name='email_address']", function(){
        ga('send', 'event', 'Articles Nav', 'Focus', 'Newsletter Signup');
    });
    $("body").on("submit", ".tab-content .form-wrapper", function(){
        ga('send', 'event', 'Articles Nav', 'Submit', 'Newsletter Signup');
    });
    // in Content
    $("body").on("click", ".content-block .form-wrapper .socials-list .facebook", function(){
        ga('send', 'event', 'Content', 'Click', 'Facebook');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .twitter", function(){
        ga('send', 'event', 'Content', 'Click', 'Twitter');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .google", function(){
        ga('send', 'event', 'Content', 'Click', 'Google+');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .linkedin", function(){
        ga('send', 'event', 'Content', 'Click', 'LinkedIn');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .instagram", function(){
        ga('send', 'event', 'Content', 'Click', 'Instagram');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .vimeo", function(){
        ga('send', 'event', 'Content', 'Click', 'Vimeo');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .youtube", function(){
        ga('send', 'event', 'Content', 'Click', 'Youtube');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .pinterest", function(){
        ga('send', 'event', 'Content', 'Click', 'Pinterest');
    });
    $("body").on("click", ".content-block .form-wrapper .socials-list .rss", function(){
        ga('send', 'event', 'Content', 'Click', 'RSS');
    });
    $("body").on("focus", ".content-block .form-wrapper input[name='email_address']", function(){
        ga('send', 'event', 'Content', 'Focus', 'Newsletter Signup');
    });
    $("body").on("submit", ".content-block .form-wrapper", function(){
        ga('send', 'event', 'Content', 'Submit', 'Newsletter Signup');
    });

    $("body").on("click", ".content-block .addthis_button_twitter", function(){
        ga('send', 'event', 'Content', 'Share', 'Twitter');
    });
    $("body").on("click", ".content-block .addthis_button_facebook", function(){
        ga('send', 'event', 'Content', 'Share', 'Facebook');
    });
    $("body").on("click", ".content-block .addthis_button_email", function(){
        ga('send', 'event', 'Content', 'Share', 'Email');
    });

    $("body").on("click", ".newsletter-signup-page input[name='first_name']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'First Name');
    });
    $("body").on("click", ".newsletter-signup-page input[name='last_name']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'Last Name');
    });
    $("body").on("click", ".newsletter-signup-page input[name='email_address']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'Email');
    });
    $("body").on("click", ".newsletter-signup-page input[name='company']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'Company');
    });
    $("body").on("click", ".newsletter-signup-page input[name='twitter']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'Twitter');
    });
    $("body").on("click", ".newsletter-signup-page button[name='submit']", function(){
        ga('send', 'event', 'Newsletter Signup', 'Click', 'Sign Up');
    });

    $("body").on("click", ".newsletter-signup-page input[name='daily']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Daily Email');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Daily Email');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='advertising']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Advertising Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Advertising Weekly');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='automotive']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Automotive Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Automotive Weekly');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='design']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Design Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Design Weekly');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='health']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Health Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Health Weekly');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='retail']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Retail Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Retail Weekly');
        }
    });
    $("body").on("click", ".newsletter-signup-page input[name='travel']", function(){
        if ($(this).is(":checked")){
            ga('send', 'event', 'Newsletter Signup', 'On', 'Travel Weekly');
        } else {
            ga('send', 'event', 'Newsletter Signup', 'Off', 'Travel Weekly');
        }
    });

    $("html").click(function(event) {
        if ((!$(event.target).is(".side-menu") &&
            !$(event.target).is(".top-nav .menu-lnk") &&
            !$(event.target).is(".top-page-header .topics-expand") &&
            !$(event.target).is(".top-page-header .topic-expand-mobile") &&
            $(event.target).parents(".side-menu").length==0) ||
            $(event.target).is(".side-menu .close-btn") ||
            $(event.target).is(".side-menu .title")) {
            $('.side-menu, .top-page-header .topics-expand, .topic-expand-mobile').removeClass("active");
            //$('.top-page-header .topics-expand').text("TOPICS");
        }
    });

    // GA tracking reports order

    if ($(".track_clicks_on_products").length > 0) {
        $("body").on("click", ".track_clicks_on_products .tracking_click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            var _that_href = $(this).attr('href');
            var report_data = $(this).closest(".report_data_info");
            if (report_data.data('price') > 0) {
                ga('ec:addProduct', {
                    'id': report_data.data('id'),
                    'name': report_data.data('name'),
                    'list': 'Reports List Page',
                    'price': report_data.data('price')
                });
                ga('ec:setAction', 'click', { 'list': 'Reports List Page' });
                ga('send', 'event', 'Reports List Page', 'Click', report_data.data('name'), {
                    'hitCallback': function() {
                        document.location = _that_href;
                    }
                });
            } else {
                document.location = _that_href;
            }
            return false;
        });
    }

    if ($(".track_show_on_report").length > 0) {
        var report_data = $(".track_show_on_report");
        if (report_data.data('price') > 0) {
            ga('ec:addImpression', {
                'id': report_data.data('id'),
                'name': report_data.data('name'),
                'list': 'Reports List Page',
                'price': report_data.data('price')
            });
            ga('ec:setAction', 'detail');
            ga('send', 'pageview');
        }
    }

    $("body").on("click", ".tracking_add_to_cart", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var _that_href = $(this).attr('href');
        var report_data = $(this).closest(".report_data_info");
        if (report_data.data('price') > 0) {
            ga('ec:addProduct', {
                'id': report_data.data('id'),
                'name': report_data.data('name'),
                'price': report_data.data('price'),
                'quantity': 1
            });
            ga('ec:setAction', 'add');
            ga('send', 'event', 'Report', 'Click', 'Add To Cart', {
                'hitCallback': function() {
                    document.location = _that_href;
                }
            });
        } else {
            document.location = _that_href;
        }

        return false;
    });
    var tracking_add_to_cart_form_submit = true
    $(".tracking_add_to_cart_form").on("submit", function (e) {
        if (tracking_add_to_cart_form_submit == false){
            return true;
        } else {
            e.stopPropagation();
            e.preventDefault();
            var _that_form = $(this);
            var is_set_action = false;
            if ($("input[name='book_check[]']:checked").length > 0) {
                $("input[name='book_check[]']:checked").each(function () {
                    var report_data = $(this);
                    if (report_data.data('price') > 0) {
                        ga('ec:addProduct', {
                            'id': report_data.data('id'),
                            'name': report_data.data('name'),
                            'price': report_data.data('price'),
                            'quantity': 1
                        });
                        is_set_action = true;
                    }
                });
            }
            if (is_set_action == true) {
                ga('ec:setAction', 'add');
                ga('send', 'event', 'Report Single Page', 'Click', 'Add To Cart', {
                    'hitCallback': function() {
                        tracking_add_to_cart_form_submit = false;
                        _that_form.find("input[type='submit']").trigger("click");
                    }
                });
            } else {
                _that_form.find("input[type='submit']").trigger("click");
            }
        }
    });
    $(".tracking_add_to_cart_form input[name='book_check[]']").on("change", function () {
        tracking_add_to_cart_form_submit = true;
    });

    $("body").on("click", ".track_remove_product_from_cart", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var _that_href = $(this).attr('href');
        var report_data = $(this).closest(".cart_item").find(".report_cart_data_info");
        // console.log('report_data:', report_data);
        if (report_data.data('price') > 0) {
            ga('ec:addProduct', {
                'id': report_data.data('id'),
                'name': report_data.data('name'),
                'price': report_data.data('price'),
                'quantity': report_data.data('quantity')
            });
            ga('ec:setAction', 'remove');
            ga('send', 'event', 'Cart', 'Click', 'Remove From Cart', {
                'hitCallback': function() {
                    document.location = _that_href;
                }
            });
        } else {
            document.location = _that_href;
        }
        return false;
    });

    if ($(".track_show_on_checkout_cart").length > 0) {
        var is_set_action = false;
        $(".report_cart_data_info").each(function () {
            var report_data = $(this);
            if (report_data.data('price') > 0) {
                ga('ec:addProduct', {
                    'id': report_data.data('id'),
                    'name': report_data.data('name'),
                    'price': report_data.data('price'),
                    'quantity': report_data.data('quantity')
                });
                is_set_action = true;
            }
        });
        if (is_set_action == true) {
            ga("ec:setAction", "checkout", {
                "step": 1,
                'option': 'view cart'
            });
            ga("send", "pageview")
        }

    }

    $("body").on("click", ".tags-dropdown .target", function(e){
        e.preventDefault();
        $(this).next(".tags").toggleClass("active")
    });

    $("html").click(function(event) {
        if ($(event.target).closest('.tags-dropdown .target').length === 0) {
            $('.tags-dropdown .tags').removeClass("active");
        }
    });
//  ???


    $("a.menu-link.newsletter").click(function(e){
        e.preventDefault();
        $(".newsletter-popup").addClass("active");
        $("html").click(function(event){
            if($(event.target).closest('a.menu-link.newsletter, .newsletter-popup').length===0){
                $('.newsletter-popup').removeClass("active");
            }
        });
    });
    $(".newsletter-popup .close-btn").click(function(e){
        e.preventDefault();
        $(".newsletter-popup").removeClass("active");
    });

    $('.twitter_share').click(function(event) {
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(url, 'twitter', opts);

        return false;
    });
    $('.facebook_share').click(function(event) {
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(url, 'facebook', opts);

        return false;
    });
    $('.pinterest_share').click(function(event) {
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(url, 'pinterest', opts);

        return false;
    });


    $("#newsletter_form").validate({
        rules: {
            email: {
                required: true,
                email: true,
                minlength: 5,
                maxlength: 254
            }
        }
    });

    $("#newsletter_signup_form").validate({
        rules: {
            first_name: {
                required: false,
                minlength: 2,
                maxlength: 32
            },
            last_name: {
                required: false,
                minlength: 2,
                maxlength: 32
            },
            email_address: {
                required: true,
                email: true,
                minlength: 5,
                maxlength: 254
            },
            company: {
                required: false,
                minlength: 2,
                maxlength: 32
            },
            twitter: {
                required: false,
                minlength: 2,
                maxlength: 32
            }
        }
    });

    // No support for background-blend-mode
    if(!("backgroundBlendMode" in document.body.style)) {
        var html = document.getElementsByTagName("html")[0];
        html.className = html.className + " no-background-blend-mode";
    }

    //if($("#wpadminbar").length > 0) {
    //    $(".main-wrapper .top-nav").css('top' , '32px');
    //}

    //Sticky control panel on Single Event Page
    if ($('.single-event-buttons').length>0) { // make sure ".sticky" element exists
        var startStickyTop = $('.single-event-buttons').offset().top; // returns number
        $(".main-wrapper .container .container-wrapper .content-block").on("scroll", function(){ // scroll event
//            var stickyTop = $('.single-event-buttons').offset().top; // returns number
            if ($(".main-wrapper .container .container-wrapper .content-block").scrollTop() >= startStickyTop){
                $('.single-event-buttons').css('position','fixed').addClass("float-control-panel");
            }
            else {
                $('.single-event-buttons').css('position','inherit').removeClass("float-control-panel");
            }
        });
    }

    $("body").on("click", ".share-mobile", function(){
        //console.log("!");
        //console.log($(this).parent("li").parent("ul").parent("div").prev(".subimage-block"));
        $(this).parent("li").parent("ul").parent("div").prev(".subimage-block").slideToggle();
        return false;
    });

    if(navigator.userAgent.indexOf('Mac') > 0){
        $('body').addClass('mac-os');
    }

    setInterval(function(){
        if (window.location.href.slice(-1) == '#'){
            window.history.pushState("", document.title, window.location.origin+window.location.pathname+window.location.search);
        }
    }, 100);

    var tooltipcustom;
    $(".plan-info").on('touchstart',function() {
        clearTimeout(tooltipcustom);
        $(this).closest("tr").prev(".wide-popover").find("td").stop().fadeIn(100);
    });
    $(".features-table table tr i.cancel").on('touchstart',function(e) {
        e.stopPropagation();
        e.preventDefault();
        tooltipcustom = setTimeout(function(){
            $(".features-table table tr.wide-popover td").stop().fadeOut(100);
        }, 300);
        return false;
    });
    $(document).on("touchstart", function(){
        if($(this).closest(".wide-popover").length == 0 && $(this).closest(".plan-info").length == 0){
            if ($(".features-table table tr.wide-popover td:visible").length > 0){
                tooltipcustom = setTimeout(function(){
                    $(".features-table table tr.wide-popover td").stop().fadeOut(100);
                }, 300);
            }
        }
    });

    $(".plan-info").on('mouseover',function() {
        clearTimeout(tooltipcustom);
        $(this).closest("tr").prev(".wide-popover").find("td").stop().fadeIn(100);
    });
    $(".features-table table tr.wide-popover").on('mouseover',function() {
        clearTimeout(tooltipcustom);
        $(this).find("td").stop().fadeIn(100);
    });
    $(".plan-info").on('mouseout',function() {
        var _that = $(this);
        tooltipcustom = setTimeout(function(){
            _that.closest("tr").prev(".wide-popover").find("td").stop().fadeOut(100);
        }, 300);
    });
    $(".features-table table tr.wide-popover").on('mouseout',function() {
        var _that = $(this);
        tooltipcustom = setTimeout(function(){
            _that.find("td").stop().fadeOut(100);
        }, 300);
    });


    if(getCookie("show_adv")) {
        customSetCookie("show_adv2weeks", 1);
        delCookie("show_adv");
    }


    if(getCookie("show_adv2weeks")) {
        jQuery("#advert-popup").hide();
    }

    setTimeout(function() {
        jQuery("#advert-popup").hide();
        customSetCookie("show_adv2weeks", 1);
    }, 10000);

    jQuery("body").delegate(".advert-close, .advert-link", "click", function() {
        customSetCookie("show_adv2weeks", 1);
        jQuery("#advert-popup").hide();
        return true;
    });

    jQuery('.watch-trigger').on("click", function(){
        jQuery('#splash-video_html5_api')[0].play() && jQuery('.top-video-block .caption-wrapper').fadeOut('slow');
        jQuery('.cancel-video').fadeIn("slow")
    });

    jQuery('.cancel-video').on("click", function(){
        jQuery('.cancel-video').fadeOut("slow");
        jQuery('#splash-video_html5_api')[0].pause();
        jQuery('.top-video-block .caption-wrapper').fadeIn('slow')
    });

    if (jQuery('#slidee-frame').length > 0) {
        var frame = jQuery('#slidee-frame');
        var slidee = frame.children('ul').eq(0);
        var wrap = frame.parent();

        frame.sly({
            horizontal: 1,
            itemNav: 'basic',
            smart: 1,
            activateOn: 'click',
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1,
            startAt: 0,
            scrollBar: wrap.find('.scrollbar'),
            scrollBy: 1,
            pagesBar: wrap.find('.pages'),
            activatePageOn: 'click',
            speed: 300,
            elasticBounds: 1,
            //easing: 'easeOutExpo',
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1
        });

        jQuery(window).on('resize', function () {
            if (jQuery('#slidee-frame').length) {
                frame.sly('reload')
            }
        });
    }
    jQuery(window).on('resize', function () {
        pulseMargin();
    });
    var pulse_margin_interval_n = 0
    var pulse_margin_interval = setInterval(function () {
        pulse_margin_interval_n++;
        pulseMargin();
        if (pulse_margin_interval_n >= 120) {
            clearInterval(pulse_margin_interval);
        }
    }, 1000);

    pulseMargin();

    if ($(".corporate-membership").length) {
        $('.corporate-carousel').bxSlider({
            minSlides: 3,
            maxSlides: 6,
            slideWidth: 200,
            slideMargin: 10,
            pager: false,
            auto: true,
            pause: 5000,
            preloadImages: 'all',
            onSliderLoad: function(){
                $(".corporate-carousel-slides").css("visibility", "visible");
            }
        });

        $('.corp-bottom-contact .scroll-top').on("click", function(){
            $("html, body").animate({ scrollTop: 0 }, 600);
            return false;
        });

        // scroll is still position
        var scroll = $(document).scrollTop();
        var headerHeight = $('.corporate-membership header').outerHeight();

        $(window).scroll(function() {
            var scrolled = $(document).scrollTop();

            if (scrolled > headerHeight){
                $('.corporate-membership header').addClass('off-canvas');
            } else {
                $('.corporate-membership header').removeClass('off-canvas');
            }

            scroll = $(document).scrollTop();
        });


    }
}); //Jquery

var pulseMargin = function() {
    if (jQuery('.single-post .post-item').length > 0) {
        var post_item_height = jQuery('.single-post .post-item').height();
        var post_item_position = jQuery('.single-post .post-item').offset().top;
        jQuery('.control-panel-block .sidebar-pulse-post-list').removeAttr('style');
        var pulse_post_list_position = jQuery('.control-panel-block .sidebar-pulse-post-list').offset().top;

        if (post_item_height+post_item_position > pulse_post_list_position) {
            var pulse_margin_top = (post_item_height+post_item_position)-pulse_post_list_position+3;
            jQuery('.control-panel-block .sidebar-pulse-post-list').css('margin-top' , pulse_margin_top+'px')
        }
    }
};

function customSetCookie(name,value,path,theDomain,secure) {
    var cookieToday = new Date();
    var expiryDate = new Date(cookieToday.getTime() + (14*24*60*60*1000));
    value = encodeURIComponent(value);
    var theCookie = name + "=" + value +
        ((expiryDate)    ? "; expires=" + expiryDate.toGMTString() : "") +
        "; path=\/" +
            /*"; domain=" + document.location.hostname +*/
        ((secure)     ? "; secure"            : "");
    document.cookie = theCookie;
}


function videoPlayPrepare() {
    if (jQuery(".video-jq .video-visible.play-on").length>0){
        jQuery(".video-jq .video-visible.play-on").each(function(){
            videoPlayStop(jQuery(this))
        });
    }
}

function videoPlayStop(videoEl){
    if (videoEl.hasClass("play-on")){
        videoEl.removeClass("play-on");
        videoEl.addClass("play-off");
        var htmlVideo = videoEl.html();
        videoEl.html(videoEl.next(".video-hidden").html());
        videoEl.next(".video-hidden").html(htmlVideo);
    }
}

function videoPlayStart(videoEl){
    if (videoEl.hasClass("play-off")){
        videoEl.removeClass("play-off");
        videoEl.addClass("play-on");
        var htmlVideo = videoEl.html();
        videoEl.html(videoEl.next(".video-hidden").html());
        videoEl.next(".video-hidden").html(htmlVideo);
    }
}

var post_modifed = '';
function checkUpdatePage(){
    setInterval(function () {
        getPostDateModify();
    }, 120000);

}

function getPostDateModify(){
    jQuery.ajax({
        method: 'POST',
        url: MyAjax.ajaxurl,
        data:{
            'action': 'check_updated_page',
            'post_url':   window.location.pathname
        },
        dataType: 'json'
    }).done(function(response){
        //console.log('date_modified:',response.date_modified);
        if (post_modifed != response.date_modified && post_modifed != ''){
            window.location.reload();
        }
        post_modifed = response.date_modified;
    });
}

var reportsWrapper = jQuery('.main-wrapper.trend-reports');
var trendFilter = jQuery('.trend-reports-filter');
var featuredReport = jQuery('.featured-trend-report');
var trendPosts = jQuery('.trend-reports .content-posts');
var trendReportsItem = jQuery('.trend-reports .trend-item');

function runIt() {
    if((jQuery(window).width() < 768)) {
        trendFilter.addClass("scroll-filter-up");
        // trendReportsItem.addClass("scroll-trenditem-up");
        // reportsWrapper.addClass("scroll-reports-up");
        featuredReport.addClass("scroll-featuredreport-up");
        // trendPosts.addClass("scroll-trendposts-up");


        // trendFilter.animate({
        //     top: 175 + 'px'
        // }, 1000);
        // trendFilter.css({'position': 'fixed', 'z-index': '200', 'margin': '0', 'width': '100%'});
        // trendReportsItem.css('margin-bottom', '45px');
        // reportsWrapper.css({'padding-top': '0', 'margin-top': '80px'});
        // featuredReport.css({
        //     'overflow': 'hidden',
        //     'position': 'fixed',
        //     'width': '100%',
        //     'left': '0',
        //     'z-index': '170',
        //     'min-height': 'inherit'
        // });
        // featuredReport.animate({
        //     height: 100 + 'px'
        // }, 1000);
        // trendPosts.animate({
        //     paddingTop: 160 + 'px'
        // }, 1000)
    }
}

jQuery(window).on('scroll' , function () {
    // filterMove()
    if (jQuery(window).width() < 768) {
        if (jQuery(window).scrollTop() >= 150) {
            trendFilter.addClass("scroll-filter-up");
            featuredReport.addClass("scroll-featuredreport-up");
        } else {
            trendFilter.removeClass("scroll-filter-up");
            featuredReport.removeClass("scroll-featuredreport-up");
        }
    }
});

jQuery(window).on('resize' , function () {
    if(jQuery(window).width() > 768) {
        // reportsWrapper.attr({style : ""});
        reportsWrapper.removeClass("scroll-reports-up");
        // trendFilter.stop().attr({style : ""});
        trendFilter.removeClass("scroll-filter-up");
        // featuredReport.stop().attr({style : ""});
        featuredReport.removeClass("scroll-featuredreport-up");
        // trendPosts.stop().attr({style : ""});
        trendPosts.removeClass("scroll-trendposts-up");
    }
});