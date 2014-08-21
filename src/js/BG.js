var BG = (function() {

	var ua = navigator.userAgent.toLowerCase(),
		isStrict = document.compatMode === "CSS1Compat",
		isOpera = ua.indexOf("opera") > -1,
		isChrome = ua.indexOf("chrome") > -1,
		isSafari = !isChrome && ua.indexOf("safari") > -1,
		isWebkit = isChrome || isSafari,
		isFirefox = ua.indexOf('firefox') > -1,
		isIE = !isOpera && ua.indexOf("msie") > -1,
		isIE6 = !isOpera && ua.indexOf("msie 6") > -1,
		isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
		isIE8 = !isOpera && ua.indexOf("msie 8") > -1,
		isIE9 = !isOpera && ua.indexOf("msie 9") > -1,
		isWindows = (ua.indexOf("windows") !== -1 || ua.indexOf("win32") !== -1),
		isMac = (ua.indexOf("macintosh") !== -1 || ua.indexOf("mac os x") !== -1),
		isLinux = (ua.indexOf("linux") !== -1);

	return {
		isStrict: isStrict,
		isOpera: isOpera,
		isChrome: isChrome,
		isSafari: isSafari,
		isWebkit: isWebkit,
		isFirefox: isFirefox,
		isIE: isIE,
		isIE6: isIE6,
		isIE7: isIE7,
		isIE8: isIE8,
		isIE9: isIE9,
		isWindows: isWindows,
		isMac: isMac,
		isLinux: isLinux,
		emptyFn: function() {},

		setCookie: function(name, value) {
			document.cookie = name + "=" + value + "; path=/";
		},

		getNumericCookie: function(name) {
			return +this.getCookie(name);
		},

		getBooleanCookie: function(name) {
			return (this.getCookie(name) === 'true');
		},

		getCookie: function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while(c.charAt(0) === ' ') {
					c = c.substring(1, c.length);
				}
				if(c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
			return null;
		},

		getParam: function(param) {
			// TODO: extend this to support multivalued parameters
			if(!this.qs) {
				var qs, i, kvp;
				this.qs = {};
				qs = location.search.substr(1).split('&');
				for(i = 0; i < qs.length; i++) {
					kvp = qs[i].split('=');
					this.qs[kvp[0]] = decodeURIComponent(kvp[1]);
				}
			}

			return this.qs[param];
		},

		getNumParam: function(param) {
			return +this.getParam(param);
		},

		getBoolParam: function(param) {
			var v = this.getParam(param);
			return (v.toLowerCase() === 'true' || v === 1);
		},

		namespace: function() {
			var a = arguments,
				i, j, s, o;

			for(j = 0; j < a.length; j++) {
				s = a[j].split(".");
				o = window;
				for(i = 0; i < s.length; i++) {
					o[s[i]] = o[s[i]] || {};
					o = o[s[i]];
				}
			}
		}
	};
})();

$(document).ready(function() {
	if(BG.isStrict) $('body').addClass('strict');
	if(BG.isOpera) $('body').addClass('opera');
	if(BG.isChrome) $('body').addClass('chrome');
	if(BG.isWebkit) $('body').addClass('webkit');
	if(BG.isSafari) $('body').addClass('safari');
	if(BG.isFirefox) $('body').addClass('firefox');
	if(BG.isIE) $('body').addClass('ie');
	if(BG.isIE6) $('body').addClass('ie6');
	if(BG.isIE7) $('body').addClass('ie7');
	if(BG.isIE8) $('body').addClass('ie8');
	if(BG.isIE9) $('body').addClass('ie9');
	if(BG.isWindows) $('body').addClass('windows');
	if(BG.isMac) $('body').addClass('mac');
	if(BG.isLinux) $('body').addClass('linux');
});

Date.now = Date.now || function() {
	return (new Date()).getTime();
};

$.extend(Array.prototype, {
	rotate: function(counterclockwise) {
		if(counterclockwise) {
			this.push(this.shift());
		} else {
			this.unshift(this.pop());
		}

		return this;
	}
});

$.extend(String.prototype, {

	strip: function(chars) {
		var a = this.split(""),
			c = (chars || "").split("");
		for(var i = 0; i < c.length; i++) {
			var p = a.indexOf(c[i]);
			if(p != -1) {
				delete a[p];
			}
		}
		return a.join("");
	},

	shuffle: function() {
		a = this.split('');

		for(var i = a.length - 1; i; i--) {
			var j = parseInt(Math.random() * i);
			var tmp = a[i];
			a[i] = a[j];
			a[j] = tmp;
		}

		return a.join('');
	},

	sort: function() {
		return this.split('').sort().join('');
	},

	containsSame: function(string, ignoreWhiteSpace) {
		var a = string.sort(),
			b = this.sort();
		if(ignoreWhiteSpace) {
			return $.trim(a) == $.trim(b);
		} else {
			return a == b;
		}
	},

	containsSameIgnoreCase: function(string, ignoreWhiteSpace) {
		return this.toLowerCase().containsSame(string.toLowerCase(), ignoreWhiteSpace);
	},

	occurrences: function(char) {
		return this.split(char).length - 1;
	}
});