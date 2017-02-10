/**
 * Created by grandiz on 26.11.15.
 * anatoly.astapov@grandiz.com
 */


if (window.addEventListener){
    window.addEventListener("message", listener,false);
} else {
    window.attachEvent("onmessage", listener);
}

function listener(event){
    var object = event.data;

    var pathname;
    try {
        pathname = jQuery(location).attr('pathname');
        pathname = pathname.split("/");
        pathname = pathname[1];
    } catch (_) {};

    if(object.type == "pw-alert-subscribe" && object.value != '') {

        jQuery.ajax({
            method: 'POST',
            url: MyAjax.ajaxurl,
            data:{
                'action': 'pw_member_alert_subscribe',
                'alerts_data': object.value
            },
            dataType: 'json'
        }).done(function(response){
            console.log('member_alert_subscribe: response: ', response);
        });
    }

    if(object.type == "pw_ready") {
        jQuery(".sign-in a").html('SIGN IN');
        jQuery(".sign-in a").removeClass('loading');
    }

    if(object.type == 'callback' && object.value == "pw-close" ) {
        setCookie("__pwc", "goTo_main");
        event_send('pw_close_modal', 'callback');
    }

    if(object.type == 'callback' && object.value == "membership" ) {
        redirect("/membership");
        event_send('pw_close_modal', 'callback');
    }
    
    if(object.type == 'changePlan' && object.value ) {
        setAction('refresh');
    }

    if(object.type == 'authorized' && object.value ) {
        event_send('pw_close_modal', 'auth');
        if(pathname == "membership") {

            delCookie("__pwc");
            redirect("/");

        } else {
            event_send('pw_reload_page', 1);
        }
    }

    if(object.type == 'registered' && object.value ) {
        setAction('goTo_main');
    }

    if(object.type == 'updateProfile' && object.value ) {
        setAction('refresh');
    }

    /*if(object.type == 'close' || object.value == "close") {
        jQuery('#subscription-popup').toggle();
        jQuery('#subscription-popup iframe').attr('src','');
    }*/

    if(object.type == 'OrderCompleted' && object.value ) {
        setAction('goTo_main');
    }
    /*if(object.type == 'pw_modal_closed' && object.value /!*|| object.type == 'callback' && object.value == 'logout'*!/) {
        jQuery(".account").html('<img src="/wp-content/themes/psfk4.1/assets/images/membership/loader_16x16.gif" /> logout...');
        setAction('goTo_main');
        //event_send('pw_public_logout', 1);
        event_send('pw_close_modal', 'logout');
    }
    if(object.type == 'pw_modal_closed' && object.value == 'logout') {
        jQuery(".account").html('<img src="/wp-content/themes/psfk4.1/assets/images/membership/loader_16x16.gif" /> logout...');
        setAction('goTo_main');
        event_send('pw_close_modal', 'logout');
    }*/

    if(object.type == 'show' && object.value == "/sign_up" ) {
        if(getCookie('__pwsk') == "next_skip") {
            setCookie('__pwsk', "");
        } else {
            event_send('pw_close_modal', 'info');
            redirect("/membership");
        }
    }

    if(object.type == 'show' && object.value == "/more_info" ) {
        event_send('pw_close_modal', 'info');
        redirect("/membership");
    }

    if(object.type == 'redirect' && object.value ) {
        redirect(object.value);
    }

    if(object.type == 'error' && object.value) {
       setCookie('__pwsk', 'next_skip');
    }

    if(object.type == 'SetNewPassword' && object.value) {
        setAction('goTo_main');
    }

    if(object.type == 'AutoSigIn' && object.value) {
        setAction('refresh');
    }

    if(object.type == 'confirmed') {
        //after confirmed email
        setAction('goTo_main');
    }

    if(object.type == 'SetNewPassword') {
        setAction('goTo_main');
    }

    if(object.type == 'need_confirm' && object.value) {
        // after change email
        setAction('goTo_main');
    }

    if(object.type == 'pw_deja_vu' && object.value) {
        setCookie('deja_vu', true);
    }


    if(object.type == 'pw_height' && object.value > 0 ) {
        if (jQuery('.popup-container iframe').length > 0){
            var popup_height = object.value + 16 /*+ 30*/;
            jQuery('.popup-container iframe').animate({
                'height': popup_height +'px'
            });
        }
    }

    if(object.type == 'pw_close_modal'  /*&& object.value == null ||  object.type == "pw-close" */) {
        console.log("pw_close_modal");

        if(getCookie('__pwc') == "refresh") {
            delCookie("__pwc");
            refresh();
        } else if(getCookie('__pwc') == "goTo_main") {
            delCookie("__pwc");
            redirect("/");
        }
    }

    if(object.type == 'pw_modal_closed') {
        switch (getCookie('__pwc')) {
            case "refresh" :
                delCookie("__pwc");
                refresh();
                break;

            case "goTo_main" :
                delCookie("__pwc");
                redirect("/");
                break;
        }
    }


    if(object.type == "pw-membershippage") {
        event_send('pw_close_modal', 'info');
        redirect("/membership?" + object.value);
    }

    if(object.type == "pw-close") {
        event_send('pw_close_modal', 'info');
    }

}

var setAction = function (action) {
    if(getCookie("__pwc") ==  undefined || getCookie("__pwc") == "" || !getCookie("__pwc")) {
        setCookie("__pwc", action);
    }
};

var event_send = function (k, v) {
    top.postMessage({'type':k, 'value':v}, "*");
}

function setCookie (name,value,path,theDomain,secure) {
    var cookieToday = new Date();
    var expiryDate = new Date(cookieToday.getTime() + (365 * 86400000)); // a year
    value = encodeURIComponent(value);
    var theCookie = name + "=" + value +
        ((expiryDate)    ? "; expires=" + expiryDate.toGMTString() : "") +
        "; path=\/" +
        /*"; domain=" + document.location.hostname +*/
        ((secure)     ? "; secure"            : "");
    document.cookie = theCookie;
}

function getCookie(Name) {
    var search = Name + "="
    if (document.cookie.length > 0) { // if there are any cookies
        var offset = document.cookie.indexOf(search)
        if (offset != -1) { // if cookie exists
            offset += search.length
            // set index of beginning of value
            var end = document.cookie.indexOf(";", offset)
            // set index of end of cookie value
            if (end == -1) end = document.cookie.length
            return decodeURIComponent(document.cookie.substring(offset, end))
        }
    }
}

function delCookie(name,path,domain) {
    //if (getCookie(name)) {
        document.cookie = name + "=" +
        "; path=\/" +
        "; domain=" + document.location.hostname +
        ";expires=Thu, 01-Jan-70 00:00:01 GMT";

        document.cookie = name + "=" +
        "; path=\/" +
        ";expires=Thu, 01-Jan-70 00:00:01 GMT";
    //}
}

var redirect = function(url) {
    jQuery(".account").html('<img src="/wp-content/themes/psfk4.1/assets/images/membership/loader_16x16.gif" />');
    window.location.replace(url);
}

var refresh = function() {
    jQuery(".account").html('<img src="/wp-content/themes/psfk4.1/assets/images/membership/loader_16x16.gif" />');
    window.location.reload();
}