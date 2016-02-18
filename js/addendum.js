//New Loading functions 
//Super hacky smacky jQuery 

(function(){

	var appendTarget = $('.wrapper:last-of-type'); //Our append target. This is pretty accurate
	var articlesLoaded = 0; //default matches index 


	$('.reading-list-link').click(function(event){
		//console.log($(this).attr('data-sm-reading-list-item-url'));
		event.preventDefault();

		var loadTheseArticles = $('.reading-list-link').index(this); alert(loadTheseArticles);
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
		}
	});


	function getArticles(key){
		//console.log(key);
		ourLink="text"+key+".txt";
		ourArticles = [];

		get(ourLink).then(function(response){
			console.log('success!', response);
			ourArticles.push(response);
		},function(error){
			console.log('failhorns ', error);
		}).then(function(){
			console.log(ourArticles);
		});

		/*var newArticle = $.ajax({
					//url:"http:"+$(this).attr('data-sm-reading-list-item-url'),
					url:ourLink,
					//asynch:false,
					cache: false
					});
		newArticle.done(function(contents){
			return contents;
		});*/
		
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


	function deployToPage(ajaxedInArticles){
		var onDeckContent = ajaxedInArticles.pop(); //our last item, we can iterate through the other items 
		if(ajaxedInArticles.length>0){
			//append the other articles we have to pull before dropping in the ondeck item
		}
		var onDeckArticle = "<div class='js-article-on-deck'>" 
							+ onDeckContent + "</div>"; //Real ugly wrapping. Need some framework stuff here
		$('html, body').animate({
			scrollTop:$('.wrapper').last().offset().top-$('.site-header-wrapper').height()-$(window).height()+400 //Need to figure something cleaner out here
		},2000);
		appendTarget.after(onDeckArticle); //has to be last rather than last-of-type
		//would love to clean up this css...
		$('.js-article-on-deck').css('width',$('.bsp-container').width()+40).css('left',$('.js-article-blur').offset().left-20); 
		//$('.js-article-on-deck').delay(2000).removeClass('js-article-on-deck');
		setTimeout(function(){
			$('.skin-light-background:last-of-type').unwrap();
			$('article, .comments').removeClass('js-article-blur');
			onDeckContent = [] //clear out our array for next time
			},2000);
	}
})();
