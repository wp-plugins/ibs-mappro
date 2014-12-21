function siteUrl() {
    var href = jQuery.url(jQuery(location).attr('href'));
    var file = href.attr('file');
    return jQuery(location).attr('href').split(file)[0]
}
function getUriQuery() {
    var result = {};
    var url = jQuery.url(jQuery(location).attr('href'));
    var query = url.attr('query');
    if (query) {
        var args = query.split('&');
        for (var i in args) {
            var arg = args[i].split('=');
            result[arg[0]] = arg[1];

        }
    }
    return result;
}
function removeHtmlStr(s) {
    return jQuery('<div>').html(s).text();
}
function padLeftStr(str, max, char) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    if (typeof max === 'undefined')
        max = 8;
    if (typeof char === 'undefined')
        char = ' ';
    return str.length < max ? padLeftStr(char + str, max, char) : str;
}
;
function padRightStr(str, max, char) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    if (typeof max === 'undefined')
        max = 8;
    if (typeof char === 'undefined')
        char = ' ';
    return str.length < max ? padRightStr(str + char, max, char) : str;
}
function hex(x) {
    var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}
function isUrl(url) {
    return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url);
}
function rgb2hex(color) {
    var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgb) {
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    } else {
        return color;
    }
}

function setCurrentColor(dialog) {
    var color = dialog.find('.line-attr').find('.colorpicker-trigger').css('background-color');
    dialog.find('.colorpicker-picker-span').each(function (index, item) {
        if (color === jQuery(item).css('background-color')) {
            jQuery(item).addClass('active');
        } else {
            jQuery(item).removeClass('active');
        }
    });
}
function getExtension(filename) {
    if (typeof filename === 'string' && filename.length > 3) {
        var pos = filename.lastIndexOf('.');
        if (pos !== -1) {
            return filename.substring(pos + 1);
        }
    }
    return false;
}
function getDirname(filename) {
    var pos = filename.lastIndexOf('/');
    var dir = filename.substring(0, pos);
    pos = dir.lastIndexOf('/');
    dir = dir.substring(pos + 1);
    return dir;
}
function getFilename(filename) {
    var pos = filename.lastIndexOf('/');
    if (pos > -1) {
        filename = filename.substring(pos + 1);
    }
    pos = filename.lastIndexOf('.');
    if (pos !== -1) {
        return filename.substring(0, pos);
    } else {
        return filename;
    }
}
function spin(bool) {
    if (bool) {
        jQuery("body").addClass('wait');
    } else {
        jQuery("body").removeClass('wait');
    }
}
function midPoint(pointA, pointB) {
    return new google.maps.LatLng(
            pointB.lat() - (0.5 * (pointB.lat() - pointA.lat())),
            pointB.lng() - (0.5 * (pointB.lng() - pointA.lng()))
            );
}
function distanceFrom(latlngA, latlngB) {
    try {
        return google.maps.geometry.spherical.computeDistanceBetween(latlngA, latlngB);
    } catch (err) {
        return 0;
    }
}
function pathLength(path) {
    try {
        return google.maps.geometry.spherical.computeLength(path);
    } catch (err) {
        return 0;
    }
}
function cleanDescription(desc) {
    u = desc.replace("<![CDATA[", "").replace("]]>", "");
    u = u.replace(/\&amp;/g, "&");
    u = u.replace(/\&lt;/g, "<");
    u = u.replace(/\&quot;/g, '"');
    u = u.replace(/\&apos;/g, "'");
    u = u.replace(/\&gt;/g, ">");
    return u;
}
function getCDATA(data) {
    if (typeof data === 'string') {
        u = data.replace("<![CDATA[", "").replace("]]>", "");
        u = u.replace(/\&amp;/g, "&");
        u = u.replace(/\&lt;/g, "<");
        u = u.replace(/\&quot;/g, '"');
        u = u.replace(/\&apos;/g, "'");
        u = u.replace(/\&gt;/g, ">");
        return u;
    }
    return '';
}
function dechex(number) {
// http://kevin.vanzonneveld.net
// +   original by: Philippe Baumann
// +   bugfixed by: Onno Marsman
// +   improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
// +   input by: pilus
// *     example 1: dechex(10);
// *     returns 1: 'a'
// *     example 2: dechex(47);
// *     returns 2: '2f'
// *     example 3: dechex(-1415723993);
// *     returns 3: 'ab9dc427'
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }
    return parseInt(number, 10).toString(16);
}
function colorKML(opacity, color) {
    if (color.substr(0, 3) === 'rgb') {
        color = rgb2hex(color);
    }
    var aa = Math.ceil(opacity * 255);
    aa = dechex(aa);
    var rr = color.substr(1, 2);
    var gg = color.substr(3, 2);
    var bb = color.substr(5, 2);
    return aa + bb + gg + rr;
}
//insure we have Date.toISOString support
if (!Date.prototype.toISOString) {
    (function () {

        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toISOString = function () {
            return this.getUTCFullYear()
                    + '-' + pad(this.getUTCMonth() + 1)
                    + '-' + pad(this.getUTCDate())
                    + 'T' + pad(this.getUTCHours())
                    + ':' + pad(this.getUTCMinutes())
                    + ':' + pad(this.getUTCSeconds())
                    + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                    + 'Z';
        };
    }());
}
function utf8_encode(argString) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // +   bugfixed by: Rafal Kukawski
    // +   improved by: kirilloid
    // +   bugfixed by: kirilloid
    // *     example 1: utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'

    if (argString === null || typeof argString === "undefined") {
        return "";
    }

    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = '',
            start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
                    (c1 >> 6) | 192,
                    (c1 & 63) | 128
                    );
        } else if (c1 & 0xF800 != 0xD800) {
            enc = String.fromCharCode(
                    (c1 >> 12) | 224,
                    ((c1 >> 6) & 63) | 128,
                    (c1 & 63) | 128
                    );
        } else { // surrogate pairs
            if (c1 & 0xFC00 != 0xD800) {
                throw new RangeError("Unmatched trail surrogate at " + n);
            }
            var c2 = string.charCodeAt(++n);
            if (c2 & 0xFC00 != 0xDC00) {
                throw new RangeError("Unmatched lead surrogate at " + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
                    (c1 >> 18) | 240,
                    ((c1 >> 12) & 63) | 128,
                    ((c1 >> 6) & 63) | 128,
                    (c1 & 63) | 128
                    );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
}
function sha1(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: sha1('Kevin van Zonneveld');
    // *     returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
    var rotate_left = function (n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };

    /*var lsb_hex = function (val) { // Not in use; needed?
     var str="";
     var i;
     var vh;
     var vl;
     
     for ( i=0; i<=6; i+=2 ) {
     vh = (val>>>(i*4+4))&0x0f;
     vl = (val>>>(i*4))&0x0f;
     str += vh.toString(16) + vl.toString(16);
     }
     return str;
     };*/

    var cvt_hex = function (val) {
        var str = "";
        var i;
        var v;

        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;

    str = this.utf8_encode(str);
    var str_len = str.length;

    var word_array = [];
    for (i = 0; i < str_len - 3; i += 4) {
        j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (str_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
            break;
    }

    word_array.push(i);

    while ((word_array.length % 16) != 14) {
        word_array.push(0);
    }

    word_array.push(str_len >>> 29);
    word_array.push((str_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
            W[i] = word_array[blockstart + i];
        }
        for (i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }


        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}
function initialCapsX(str) {
    return str.toLowerCase().replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
    }
    );
}
function initialCaps(str) {
    return str.toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function (letter) {
        return letter.toUpperCase();
    });
}