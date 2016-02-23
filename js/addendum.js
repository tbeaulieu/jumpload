	//New Loading functions 
	//Super hacky smacky jQuery 

	(function(){

		$('.reading-list-link').click(function(event){
			//console.log($(this).attr('data-sm-reading-list-item-url'));
			event.preventDefault();
			/*
			var loadTheseArticles = $('.reading-list-link').index(this);
			if(!$('.js-article-on-deck').length && articlesLoaded < loadTheseArticles){  //articles not loaded
				$('article, .comments').addClass('js-article-blur');
				var articlesReplied = []; //for each of our articles

					for(i=articlesLoaded+1; i<=loadTheseArticles; i++){
						getArticles(i);
					}
			}//end if
			else{

				$('html,body').animate({
					scrollTop:$('.skin-light-background').last().offset().top-$('.site-header-wrapper').height
				},2000);
			}*/
		});

		
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


				if(scrollDirection===1 && articles[tracker]){
					if(Math.abs(parseInt(articles[tracker].style.marginTop))>=articles[tracker].clientHeight-window.innerHeight){
						if(articles.length < keyLinks.length){
							var waitUp = debounce(getArticle(keyLinks[tracker].getAttribute('data-sm-reading-list-item-url')),250);
							articles[tracker].className += " js-article-blur"; //Blur article
						}
						else{
							
							if(tracker+1<articles.length){
								articles[tracker].className += " js-article-blur"; //Blur article
								tracker++;
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
						tracker--;
						articles[tracker].classList.remove('js-article-blur');
					}
				}//END SCROLL UP
			//reset the ticking
			ticking = false;
		}

		window.addEventListener('scroll', goScroll, false);



		function getArticle(key){
			ourLink=key; //Dummy page
			get(ourLink).then(function(response){
				deployToPage(response);
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



		function deployToPage(ajaxedInArticle){
			var newContent = "<div class='js-articles'>" + ajaxedInArticle + "</div>";
			content = document.createTextNode(newContent);
			document.getElementsByClassName('js-articles')[tracker].insertAdjacentHTML('afterend', newContent);	
			articles = document.getElementsByClassName('js-articles');//Refresh our articles object
			articles[tracker+1].style.marginTop = window.innerHeight + "px";
			footer.style.marginTop = getOurHeights();
			tracker++;
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
			for(i=0;i<tracker;i++){
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
