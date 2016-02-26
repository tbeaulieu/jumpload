//New Loading functions
//By Tristan Beaulieu
//To do:
//Scroll positions
//Eliminate jQuery Calls
//Modularize


	(function(){

		
		//Set up Global simple vars

		var 	lastScrollY = 0,
				ticking = false,
				fetchedArticle = false,
				scrollDirection = null, //0 for up, 1 for down
				tracker = 0;

		//Setup Arrays

		var		articles = document.getElementsByClassName('js-articles'), //Load all of our articles in to a big sloppy array.
				footer = document.getElementsByClassName('site-footer')[0],
				keyLinks= document.getElementsByClassName('reading-list-link');

		//init Foooter initial margin

		footer.style.marginTop = articles[tracker].clientHeight + "px";

		//Scrolling activation

		function goScroll() {	
			requestTick();
			lastScrollY = window.scrollY;
		}

		function requestTick(){
			if(!ticking){
				//Get Current Frame
				requestAnimationFrame(updateScroll);
				//See what direction we're going in (SUPER IMPORTANT)
				if(window.scrollY>lastScrollY)
					scrollDirection=1;
				else
					scrollDirection=0;
				ticking=true;
			}
		}

		function updateScroll(){
			//Debug stuff
			$('.scroll-numbers').html("offset:"+window.pageYOffset+"<br>article length "+articles.length+"<br>"+"tracking: "+tracker);
			
			var ourWindowBottom = window.innerHeight+lastScrollY; //constant updates
			if(articles[tracker]){
				articles[tracker].style.marginTop = updateOurMargin(tracker);
			}	
				
				//**********************************//
				//going down
				//**********************************//


				if(scrollDirection===1 && articles[tracker] && keyLinks[tracker+1]){
					if(Math.abs(parseInt(articles[tracker].style.marginTop))>=articles[tracker].clientHeight-window.innerHeight /* && keyLinks[tracker+1].getAttribute('data-loaded')==="false"*/){
						if(keyLinks[tracker+1].getAttribute('data-loaded')==="false"){
							var waitUp = debounce(getArticle(keyLinks[tracker+1].getAttribute('data-sm-reading-list-item-url'), tracker+1, 'scroll'),250);
							articles[tracker].classList.add("js-article-blur"); //Blur article
							keyLinks[tracker].parentNode.classList.remove('current');
							keyLinks[tracker+1].setAttribute('data-loaded','true');
						}
						else{ //We've already loaded this article.
							if(tracker+1<articles.length){
								console.log('regular downs');
								articles[tracker].classList.add("js-article-blur"); //Blur article
								keyLinks[tracker].parentNode.classList.remove('current');
								tracker++;
								keyLinks[tracker].parentNode.classList.add('current');

							}
						}
						
					}
				} //END GOING DOWN
			//}

				//**********************************//
				// Going up
				//**********************************//

				if(scrollDirection===0){
					if(parseInt(articles[tracker].style.marginTop)>=window.innerHeight){
						keyLinks[tracker].parentNode.classList.remove('current');
						tracker--;
						articles[tracker].classList.remove('js-article-blur');
						keyLinks[tracker].parentNode.classList.add('current');
					}
				}//END SCROLL UP
			//reset the ticking
			ticking = false;
		}

		window.addEventListener('scroll', goScroll, false);

		//Click Event

		$('.reading-list-link').click(function(event){
			event.preventDefault();
			console.log($(this).parent('li').index()+1);
			if($(this).attr('data-loaded')==="false"){
				getArticle($(this).attr('data-sm-reading-list-item-url'), $(this).parent('li').index(), "click");
				//Scroll the articles around
			}
			else{
				$(this).parent('li').siblings().removeClass('current');
				$(this).parent('li').addClass('current');
				//Scroll to this element
				articles[tracker].classList.add('js-article-blur');
				articleAnimate(tracker,"bottom");
				tracker=$(this).parent('li').index();
				articles[tracker].classList.remove('js-article-blur');
				articleAnimate(tracker,"top");

			}
			$('.scroll-numbers').html("offset:"+window.pageYOffset+"<br>article length "+articles.length+"<br>"+"tracking: "+tracker);
		});


		function getArticle(ourLink, index, method){
			get(ourLink).then(function(response){
				deployToPage(response, index, method);
			},function(error){
				console.log('failhorns ', error);
			});		
		}


		function get(url){
			return new Promise(function(resolve, reject){
				var req = new XMLHttpRequest();
				req.open('GET', url);
				req.onload = function(){
					if(req.status==200){
						resolve(req.response);
					}
					else{
						reject(Error(req.statusText));
					}
				};

				req.onerror = function() {
					reject(Error("Network Error"));
				};
				//make request
				req.send();
			})
		}



		function deployToPage(ajaxedInArticle, index, method){
			var newContent = "<div class='js-articles' data-article='"+index+"'>"+ ajaxedInArticle + "</div>";
			content = document.createTextNode(newContent);
			document.getElementsByClassName('js-articles')[tracker].insertAdjacentHTML('afterend', newContent);	
			articles = document.getElementsByClassName('js-articles');//Refresh our articles object
			articles[tracker+1].style.marginTop = window.innerHeight + "px";
			footer.style.marginTop = getOurHeights();
			
			if(method==="scroll"){
				tracker++;
				keyLinks[tracker].parentNode.classList.add('current');
			}
			else{
				keyLinks[tracker].parentNode.classList.add('current');
			}
		}

		function articleAnimate(tracker, direction){
			var fromPos,
				toPos;
			var ourTween = new Tweenable();

			if(direction === "bottom"){
				fromPos = parseInt(articles[tracker].style.marginTop);
				toPos = -articles[tracker].clientHeight+window.innerHeight;
			}
			if(direction === "top"){
				fromPos = parseInt(articles[tracker].style.marginTop);
				toPos = 0;
			}

			console.log(direction,fromPos,toPos,articles[tracker].style.marginTop);
			ourTween.tween({
				from:{ x: fromPos },
				to: { x: toPos },
				duratation: 4000,
				easing: 'easeOutQuart',
				step: function(state){
					articles[tracker].style.marginTop = state.x + "px";
					//console.log(state.x);
				}
			});
		}

		function getOurHeights(){
			var height=0;
			for(i=0;i<articles.length;i++){
				height=height+articles[i].clientHeight;
			}
			var marginHeight = height  + "px";
			return marginHeight;
		}

		/*function getKeyLinks(linkClass){
			var links=[];
			var sidebarLinks = document.getElementsByClassName(linkClass);
			[].forEach.call(sidebarLinks, function(element){
				links.push(element.getAttribute('data-sm-reading-list-item-url'));
			});
			return links;
		}*/

		function updateOurMargin(tracker){
			var marginAmount = 0;
			for(var i=0;i<tracker;i++){
				marginAmount = parseInt(articles[i].clientHeight) + marginAmount;
			}
			return marginAmount-lastScrollY+"px";
		}


		function debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		};

	
		function outerHeight(el) {
		  var height = el.offsetHeight;
		  var style = getComputedStyle(el);
		  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
		  return height;
		}

	})();
