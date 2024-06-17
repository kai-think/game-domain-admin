import {JSEncrypt} from "jsencrypt";



export default {
	expand: function() {
		Date.prototype.toCusString = function() {
			let y = this.getFullYear()
			let M = this.getMonth() + 1
			let d = this.getDate()
			let h = this.getHours()
			let m = this.getMinutes()
			let s = this.getSeconds()
			
			if (m < 10)
				m = "0" + m;
				
			if (s < 10)
				s = "0" + s;
			
			return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
		};
		Date.prototype.toCusDateString = function() {
			let str = this.toCusString();
			let idx = str.indexOf(" ");
			return str.substr(0, idx);
		};
		Date.prototype.toCusTimeString = function() {
			let str = this.toCusString();
			let idx = str.indexOf(" ");
			return str.substr(idx + 1, str.length - idx);
		};
		Date.prototype.addSeconds = function(seconds) {
			let time = this.getTime() + seconds * 1000;
			this.setTime(time)
			return this;
		};
		Date.prototype.addMonth = function(month) {
			this.setMonth(this.getMonth() + month);
			return this;
		};
		Date.prototype.addDays = function(days) {
			this.addSeconds(days * 24 * 60 * 60);
			return this;
		}

		//任意长度RSA Key分段加密解密长字符串

		//获取RSA key 长度
		JSEncrypt.prototype.getkeylength = function () {  
			return ((this.key.n.bitLength()+7)>>3);
		};

		// 分段解密，支持中文
		JSEncrypt.prototype.decryptUnicodeLong = function (string) {
		var k = this.getKey();
		//解密长度=key size.hex2b64结果是每字节每两字符，所以直接*2
		var maxLength = ((k.n.bitLength()+7)>>3)*2;
		try {
			var hexString = b64tohex(string);
			var decryptedString = "";
			var rexStr=".{1," + maxLength  + "}";
			var rex =new RegExp(rexStr, 'g'); 
			var subStrArray = hexString.match(rex);
			if(subStrArray){
				subStrArray.forEach(function (entry) {
					decryptedString += k.decrypt(entry);
				});
				return decryptedString;
			}
		} catch (ex) {
			return false;
		}
		};
		
		// 分段加密，支持中文
		JSEncrypt.prototype.encryptUnicodeLong = function (string) {
		var k = this.getKey();
		//根据key所能编码的最大长度来定分段长度。key size - 11：11字节随机padding使每次加密结果都不同。
		var maxLength = ((k.n.bitLength()+7)>>3)-11;
		try {
			var subStr="", encryptedString = "";
			var subStart = 0, subEnd=0;
			var bitLen=0, tmpPoint=0;
			for(var i = 0, len = string.length; i < len; i++){
				//js 是使用 Unicode 编码的，每个字符所占用的字节数不同
				var charCode = string.charCodeAt(i);
				if(charCode <= 0x007f) {
					bitLen += 1;
				}else if(charCode <= 0x07ff){
					bitLen += 2;
				}else if(charCode <= 0xffff){
					bitLen += 3;
				}else{
					bitLen += 4;
				}
				//字节数到达上限，获取子字符串加密并追加到总字符串后。更新下一个字符串起始位置及字节计算。
				if(bitLen>maxLength){
					subStr=string.substring(subStart,subEnd)
					encryptedString += k.encrypt(subStr);
					subStart=subEnd;
					bitLen=bitLen-tmpPoint;
				}else{
					subEnd=i;
					tmpPoint=bitLen;
				}
			}
			subStr=string.substring(subStart,len)
			encryptedString += k.encrypt(subStr);
			return hex2b64(encryptedString);
		} catch (ex) {
			return false;
		}
		};
		//添加的函数与方法结束
	}
}