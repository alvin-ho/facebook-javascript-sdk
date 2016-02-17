console = window.console || { log: function(){} };
trace = function(response){ console.log(response); };
app_user = { id:'' };

(function(window, document){
	var ns = 'pp';
	return window[ns] = {
		app_channel: '<?=$FB_APP_CHANNEL?>',
		app_folder: '<?=$FB_APP_FOLDER?>',
		init: function(callback){
			window.fbAsyncInit = function(callback){
				return function(){
					FB.init({
						appId      : '<?=$FB_APP_ID?>',
						cookie     : true,
						xfbml      : true,
						frictionlessRequests : true,
						version    : '<?=$FB_APP_VER?>'
					});

					FB.getLoginStatus(function(auth) {
						if(auth.authResponse && auth.status == 'connected'){
							app_user.id = auth.authResponse.userID;
							if(!!callback){ callback(true); }
						}else{
							if(!!callback){ callback(false); }
						}
					});
				}
			}(callback);

			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		},
		uninstall: function(){
			FB.api('/me/permissions', 'DELETE', function(response){
				window.location.reload();
			});
		},
		login: function(callback){
			this.loginCallback = callback || function(){};
			FB.getLoginStatus(function(auth) {
				if(!auth.authResponse){
					FB.login(function(auth){
						if(auth.authResponse && auth.status == 'connected'){
							app_user.id = auth.authResponse.userID;
							window[ns].loginCallback(true);
						}else{
							window[ns].loginCallback(false);
						}
					}, {scope:'<?=$FB_PERMISSION?>'})
				}else{
					app_user.id = auth.authResponse.userID;
					window[ns].loginCallback(true);
				}
			})
		},
		logout: function(){
			FB.logout(function(){
				window.location.reload();
			});
		},
		me: function(callback){
			this.meCallback = callback || function(response){ console.log(response); };
			FB.api('/me?fields=id,name,link,first_name,last_name,gender,email,locale,timezone,verified,updated_time,age_range', function(response){
				window[ns].meCallback(response);
			});
		},
		update: function(callback){
			this.updateCallback = callback || function(response){ console.log(response); };
			FB.api('/me?fields=id,name,first_name,last_name,gender,email,locale', function(response){
				$.post('', response).done(function(response){
					window[ns].updateCallback();
				})
			});
		},
		getUserIcon: function(id, w, h){
			var w = w || 100;
			var h = h || 100;
			id = id || app_user.id;
			return 'https://graph.facebook.com/'+id+'/picture?width='+w+'&height='+h;  //type=large|small
		},
		invite: function(callback, invitedList){
			this.inviteCallback = callback || function(){};
			this.invitedList = invitedList || [];
			FB.ui({
				method: 'apprequests',
				message: '<?php /*echo $FB_INVITE["MESSAGE"] */ ?>',
				app_id: '<?php echo $FB_APP_ID ?>',
				exclude_ids: window[ns].invitedList
			},
			function(response) {
				if(response && response.request){
					//window[ns].inviteCallback(response);
				}else{
					console.log('invite cancelled');
				}
				window[ns].inviteCallback(response);
			});
		},
		autoWall: function(callback){
			this.autoWallCallback = callback || function(){};
			var option = {
				name: '<?php echo $FB_SHARE_RESULT["TITLE"] ?>',
				link: '<?php echo $FB_SHARE_RESULT["LINK"] ?>',
				picture: '<?php echo $FB_SHARE_RESULT["IMAGE"] ?>',
				caption: '<?php echo $FB_SHARE_RESULT["CAPTION"] ?>',
				description : '<?php echo $FB_SHARE_RESULT["DESCRIPTION"] ?>'
			};
			FB.api('/me/feed', 'post', option, function(response){
				if(!!response){
					console.log('Post ID: ' + response.id);
				}else{

				}
				window[ns].autoWallCallback(response);
			});
		},
		customShare: function(message, callback){
			this.shareCallback = callback || function(){};
			var option = {
				method: 'feed',
				name: message.name,
				link: message.link,
				picture: message.picture,
				caption: message.caption,
				description : message.description,
				display: 'iframe',
				to: app_user.id || null
			}
			FB.ui(option, function(response){
				if(!!response){
					//window[ns].shareCallback(response);
				}else{
					console.log('Cancelled by user');
				}
				window[ns].shareCallback(response);
			});
		},
		share: function( dataSet, callback ){
			this.shareCallback = callback || function(){};
			var option = {
				method: 'feed',
				name: dataSet.name,
				link: dataSet.link,
				picture: dataSet.pic+"?ts="+(+new Date()),
				caption: dataSet.caption,
				description : dataSet.description,
				display: 'iframe',
				to: app_user.id || null
			}
			FB.ui(option, function(response){
				if(!!response){
					//window[ns].shareCallback(response);
				}else{
					console.log('Cancelled by user');
				}
				window[ns].shareCallback(response);
			});
		},
		shareTo: function(id, callback){
			this.shareToCallback = callback || function(){};
			var option = {
				method: 'feed',
				name: '',
				link: '',
				picture: '',
				caption: '',
				description : '',
				to: id || null
			}
			FB.ui(option, function(response){
				if(!!response){
					window[ns].shareToCallback(response);
				}else{
					console.log('Cancelled by user');
				}
			});
		},
		shareResult: function(id, result, callback){
			this.shareResultCallback = callback || function(){};
			var result = result || '';
			var option = {
				method: 'feed',
				name: '<?php echo $FB_SHARE_RESULT["TITLE"] ?>',
				link: '<?php echo $FB_SHARE_RESULT["LINK"] ?>',
				picture: '<?php echo $FB_SHARE_RESULT["IMAGE"] ?>',
				caption: '<?php echo $FB_SHARE_RESULT["CAPTION"] ?>',
				description : '<?php echo $FB_SHARE_RESULT["DESCRIPTION"] ?>',
				display: 'iframe',
				to: id || null
			}
			option.description = option.description.replace('[s]', result);
			FB.ui(option, function(response){
				if(!!response){
					//window[ns].shareResultCallback(response);
				}else{
					console.log('Cancelled by user');
				}
				window[ns].shareResultCallback(response);
			});
		},
		installTab: function(){
			window.location.href = 'https://www.facebook.com/dialog/pagetab?next=https://www.facebook.com&app_id=<?=$FB_APP_ID?>';
		},
		getAccessToken: function(){
			return FB.getAccessToken();
		},
		extendAccessToken: function(){
			$.post('../include/getAccessToken.php', {atk:this.getAccessToken()}).done(trace);
		},
		parse: function(element){
			FB.XFBML.parse(element || null);
		},
		onLike: function(callback){
			this.onLikeCallback = callback || function(){}
			FB.Event.subscribe('edge.create', window[ns].onLikeCallback);
		},
		onUnLike: function(callback){
			this.onUnLikeCallback = callback || function(){}
			FB.Event.subscribe('edge.remove', window[ns].onUnLikeCallback);
		},
		setCanvas: function(width, height){
			width = width || window.innerWidth;
			height = height || window.innerHeight;
			FB.Canvas.setSize({width:width,height:height});
		},
		checkLoginStatus: function(callback){
			this.checkLoginStatusCallback = callback || function(){}
			FB.getLoginStatus(window[ns].checkLoginStatusCallback);
		}
	}
})(window, document)


create=function(ele){
	return elementAddon(ele, 1);
}
select=function(ele){
	return elementAddon(ele, 0);
}
elementAddon=function(ele, isCreate){
	if(isCreate){var node=document.createElement(ele);}else{node=ele;}
	node.setText=function(e){if(this.textContent!=undefined){this.textContent=e}else if(this.innerText!=undefined){this.innerText=e}return this};
	node.setHTML=function(e){this.innerHTML=e;return this};
	node.setAttr=function(e){for(val in e){this.setAttribute(val,e[val])}return this};
	node.getStyle=function(e){if("getComputedStyle"in window){return window.getComputedStyle(this)[e]}else{return this.style[e]}};
	node.addClass=function(e){try{if(e.length>0){var t=[];var n=e.split(" ");if(this.className.length!=0){t=this.className.split(" ")}for(var r in n){if(n[r].length>0){if(t.indexOf(n[r])==-1){t.push(n[r])}}}this.className=t.join(" ")}}catch(i){console.log(i)}return this};
	node.removeClass=function(e){try{if(e.length>0){var t=[];var n=e.split(" ");if(this.className.length!=0){t=this.className.split(" ")}for(var r in n){if(n[r].length>0){if(t.indexOf(n[r])!=-1){t.splice(t.indexOf(n[r]),1)}}}this.className=t.join(" ")}}catch(i){}return this};
	node.removeAttr=function(e){this.removeAttribute(e);return this};
	node.appendTo=function(e){e.appendChild(this);return this};
	node.append=function(e){this.appendChild(e);return this};
	node.appendAfter=function(e){e.parentNode.appendChild(this);return this};
	node.moveTo=function(e){return this.parentElement.removeChild(this).appendTo(e)};
	return node;
}
ajax=function(url, requestObj, callback){
	if(!!jQuery){
		$.ajax({url:url,data:requestObj,type:'GET'}).done(callback);
	}else{
		console.log('Error: jQuery not found');
	}
};
ajaxp=function(url, requestObj, callback, option){
	requestObj = requestObj || {};
	option = option || {};
	requestObj['url'] = url;
	requestObj['option'] = option;
	if(!!jQuery){
		$.ajax({url:ajaxProxy.path,data:requestObj,type:'POST'}).done(callback);
	}else{
		console.log('Error: jQuery not found');
	}
};
ajaxj=function(url, requestObj, callback){
	if(!!jQuery){
		$.ajax({url:url,data:requestObj,type:'POST',dataType:'json'}).done(callback);
	}else{
		console.log('Error: jQuery not found');
	}
};
