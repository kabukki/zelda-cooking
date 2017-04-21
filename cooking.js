/*
 * Lucien Le Roux - 09/04/17
 */

'use strict';

/*
 *	TODO
 *	- Bug: les niveaux ne sont pas calcules correctement.
 *	- Todo: trouver les proprietes de nouveaux ingredients.
 *	- Todo: trouver les images correspondant aux effets.
 *  - Todo: page referencant tous les ingredients d'un type donne (encyclopedia.html?type=fruit)
 *  - Todo: Revoir la logique pour acceder aux infos d'un ing/recette (id pas fiable) (formulaire ? )
 */

var items = [], dishes = [];
var queue = [];

/* DOM Vars */
var dishImage = document.getElementsByClassName('dishImage')[0]
	, dishTitle = document.getElementsByClassName('dishTitle')[0]
	, dishHearts = document.getElementById('dishHearts')
	, dishEffect = document.getElementById('dishEffect')
	, dishDuration = document.getElementById('dishDuration')
	, dishLevel = document.getElementById('dishLevel')
	, dishDesc = document.getElementsByClassName('dishDesc')[0]
	, ingredients = document.getElementById('ingredients').getElementsByClassName('ing')
	, ingredientList = document.getElementById('ingredientList')
	, clearBtn = document.getElementById('clearBtn')
	, sortSelect = document.getElementById('sortSelect');

/* Get the food.json file using the Fetch API */
if (self.fetch) {
	fetchThen('food.json', function(data) {
		items = data;
		debug && console.log(items.length + ' items loaded');
		fetchThen('recipes.json', function(data) {
			dishes = data;
			debug && console.log(getAllRecipes(dishes).length + ' dishes loaded');
			for (var i = 0; i < items.length; i++) {
				items[i].id = i;
			}
			UIQueue();
			UIdisplayIngredients(items, cmpFunctions["name"]);
			display(cook(queue));
		});
	});
} else {
	console.log("Your browser is outdated and does not support the Fetch API.");
}

/******************/
/* User Interface */
/******************/

/*
 * Add a separator in the ingredients list
 */
function UIaddSeparator(text) {
	ingredientList.appendChild(myCreateElement("div", {
		className: 'sqSeparator',
		innerHTML: text
	}));
}

/*
 * Setting up selection GUI
 * Displays all the ingredients after sorting them
 * 	 depending on the cmpSelector variable.
 */
function UIdisplayIngredients(items, cmpf) {
	while (ingredientList.firstChild) {
		ingredientList.removeChild(ingredientList.firstChild);
	}
	items.sort(cmpf.compareFull);
	for (var i = 0; i < items.length; i++) {
		(function() {
			var ci = i;
			var d = myCreateElement('div', {
				className: 'sq ing',
				innerHTML: htmlIngredient(items[i])
			});

			if (i == 0 || cmpf.compareSimple(items[i - 1], items[i]) != 0)
				UIaddSeparator(cmpf.get(items[i]));
			d.getElementsByTagName("img")[0].onclick = function() {
				addToQueue(items[ci]);
			};
			ingredientList.appendChild(d);
		})();
	}
}

/*
 * Setting up queue GUI
 */
function UIQueue() {
	for (var i = 0; i < ingredients.length; i++) {
		(function() {
			var ci = i;
			ingredients[ci].onclick = function(e) {
				if (e.target.localName == "img")
					removeFromQueue(ci);
			};
		})();
	}
}

/*
 * Event listeners
 */
clearBtn.onclick = function() {
	queue = [];
	refreshQueue();
}
sortSelect.onchange = function() {
	UIdisplayIngredients(items, cmpFunctions[sortSelect.value]);
}

/*********************/
/* Cooking functions */
/*********************/

/*
 * Combine an array of ingredients (NOT pseudo-ingredients).
 * Allows to handle effect conflicts more efficiently and levels.
 */
function cook(ing) {
	var dish = {};
	var match;

	if (ing.length == 0)
		return null;
	dish = combine(ing);
	match = getBestMatch(getAvailableRecipes(dishes, ing));
	dish.name = match ?
					(hasEffect(dish) ? dish.effect + ' ' + match.name : match.name) :
					'Dubious Food';
	dish.description = match ? match.description : 'Dubious desc';
	dish.image = match ? match.image : 'dubiousfood.png';
	return dish;
}

/*
 * Returns the number of times an ingredient appears
 * in the queue
 */
function nbTimesInArray(ing, arr) {
	var n = 0;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].name == ing.name) {
			n++;
		}
	}
	return n;
}

/*
 * Display the dish
 */
function display(dish) {
	if (dish != null) {
		dishImage.innerHTML = '<img src="img/food/' + dish.image + '"/>';
		dishTitle.innerHTML = dish.name;
		dishHearts.innerHTML = htmlHearts(dish.hearts);
		dishEffect.innerHTML = (hasRegularEffect(dish) ? htmlEffect(dish).repeat(dish.level) : '') + ' ';
		dishDuration.innerHTML = dish.duration ? getEffectTransform(dish.effect)(dish.duration) : '';
		dishDesc.innerHTML = dish.description || 'No description.';
	} else {
		dishImage.innerHTML = "";
		dishTitle.innerHTML = "";
		dishHearts.innerHTML = "";
		dishEffect.innerHTML = "";
		dishDuration.innerHTML = "";
		dishDesc.innerHTML = "";
	}
}

/********************/
/* Helper functions */
/********************/

/*
 * Search an ingredient by its name
 */
function getIngredient(name) {
	for (var i = 0; i < items.length; i++) {
		if (name == items[i].name)
			return items[i];
	}
	return null;
}

function addToQueue(ing) {
	if (queue.length == 5) {
		debug && console.log('Queue is already full!');
	} else {
		queue.push(ing);
		refreshQueue();
	}
}
function removeFromQueue(i) {
	if (i < 0 || i >= queue.length)
		return ;
	queue.splice(i, 1);
	refreshQueue();
}

/*
 * Refresh the images in the queue
 */
function refreshQueue() {
	for (var i = 0; i < 5; i++) {
		if (i < queue.length)
			ingredients[i].innerHTML = htmlIngredient(queue[i]);
		else
			ingredients[i].innerHTML = '';
	}
	display(cook(queue));
}
