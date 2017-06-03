// from https://jsfiddle.net/onury/PJbye/
    /* Caches the user-input data from the targeted form, stores it in the cookies 
     * and fetches back to the form when requested or needed. 
     */
    var formCache = (function() {
        var _form = null, 
            _formData = [],
            _strFormElements = "input[type='text']," + 
                        "input[type='checkbox']," + 
                        "input[type='radio']," + 
                        //"input[type='password']," +  //leave password field out 
                        "input[type='hidden']," + 
                        //"input[type='image']," + 
                        "input[type='file']," + 
                        "select," + 
                        "textarea";
        
        function _warn() {
            console.log('formCache is not initialized.');
        }
    
        return {
            /* Initializes the formCache with a target form (id). 
             * You can pass any container id for the formId parameter, formCache will 
             * still look for form elements inside the given container. If no form id 
             * is passed, it will target the first <form> element in the DOM. 
             */
            init: function(formId)
            {
                var f = (typeof(formId) === 'undefined' || formId === null || $.trim(formId) === '') ? 
                    $('form').first() :  $('#' + formId);
                _form = f.length > 0 ? f : null;
                console.log(_form);
            },
            /* Saves form data to cookies.
             */
            save: function()
            {
                if (_form === null) { _warn(); return; }
                
                _form
                .find(_strFormElements)
                .each(function() {
                    _formData.push( $(this).attr('id') + ':' + formCache.getFieldValue($(this)) );
                });
                docCookies.setItem('formData', _formData.join(), 31536e3); //1 year expiration (persistent)
                console.log('Cached form data:', _formData);
            },
            /* Fills out the form elements from the data previously stored in the cookies.
             */
            fetch: function()
            {
                if (_form === null) { _warn(); return; }
                
                if (!docCookies.hasItem('formData')) return;
                var fd = _formData.length < 1 ? docCookies.getItem('formData').split(',') : _formData;
                $.each(fd, function(i, item)
                {
                    var s = item.split(':');
                    var elem = $('#' + s[0]);
                    formCache.setFieldValue(elem, s[1]);
                });
            },
            /* Sets the value of the specified form field from previously stored data.
             */
            setFieldValue: function(elem, value)
            {
                if (_form === null) { _warn(); return; }
                
                if (elem.is('input:text') || elem.is('input:hidden') || elem.is('input:image') ||
                        elem.is('input:file') || elem.is('textarea')) {
                    elem.val(value);
                } else if (elem.is('input:checkbox') || elem.is('input:radio')) {
                    elem.prop('checked', value);
                } else if (elem.is('select')) {
                    elem.prop('selectedIndex', value);
                }
            },
            /* Gets the previously stored value of the specified form field.
             */
            getFieldValue: function(elem)
            {
                if (_form === null) { _warn(); return; }
                
                if (elem.is('input:text') || elem.is('input:hidden') || elem.is('input:image') ||
                    elem.is('input:file') || elem.is('textarea')) {
                        return elem.val();
                    } else if (elem.is('input:checkbox') || elem.is('input:radio')) {
                        return elem.prop('checked');
                    } else if (elem.is('select')) {
                        return elem.prop('selectedIndex');
                    }
                else return null;
            },
            /* Clears the cache and removes the previously stored form data from cookies.
             */
            clear: function()
            {
                _formData = [];
                docCookies.removeItem('formData');
            },
            /* Clears all the form fields. 
             * This is different from form.reset() which only re-sets the fields 
             * to their initial values.
             */
            clearForm: function()
            {
                _form
                .find(_strFormElements)
                .each(function() {
                    var elem = $(this);
                    if (elem.is('input:text') || elem.is('input:password') || elem.is('input:hidden') || 
                        elem.is('input:image') || elem.is('input:file') || elem.is('textarea')) {
                        elem.val('');
                    } else if (elem.is('input:checkbox') || elem.is('input:radio')) {
                        elem.prop('checked', false);
                    } else if (elem.is('select')) {
                        elem.prop('selectedIndex', -1);
                    }
                });
            }
        };
    })();

    //Initialize and fetch form data (if exists) when we load the form-page back
    $(document).ready(function() {
        
        $("form").submit(function () { return false; }); // prevent form submit
        
        $('#btnCache').click(function() {
            formCache.save();
        });
        $('#btnFetch').click(function() {
            formCache.fetch();
        });
        $('#btnClearCache').click(function() {
            formCache.clear();
        });
        $('#btnClearForm').click(function() {
            formCache.clearForm();
        });
        
        formCache.init();
        formCache.fetch();
    });
    
    //Save form data right before we unload the form-page
    $(window).bind('beforeunload', function() {
        formCache.save();
        //return false;
    });



//From Mozilla (https://developer.mozilla.org/en-US/docs/DOM/document.cookie)
var docCookies = {
  getItem: function (sKey) {
    if (!sKey || !this.hasItem(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function (sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) { return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};