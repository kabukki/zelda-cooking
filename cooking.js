'use strict';

/*
 *	TODO
 *	- Bug: viande + effect special (duration) cree des problemes. (fonction cook)
 *	- Bug: les niveaux ne sont pas calcules correctement.
 *  - Bug: Clicking on 'more info' on an ingredient in the queue pops it before redirecting
 *	- Todo: trouver les proprietes & descriptions de nouveaux ingredients.
 *	- Todo: trouver les images correspondant aux effets.
 *	- Todo: mettre au propre UIdisplayIngredients.
 *  - Todo: page referencant tous les ingredients d'un type donne (encyclopedia.html?type=fruit)
 *  - Todo: Revoir la logique pour acceder aux infos d'un ing/recette (id pas fiable) (formulaire ? )
 */

var items = [], dishes = [];
var queue = [];

var cmpFunctions = {
		"name": compareByName,
		"type": compareByType,
		"effect": compareByEffect
	},
	cmpSelector = "name"; // Global used to know how to sort items.

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
		debug && console.log("Items loaded");
		fetchThen('recipes.json', function(data) {
			dishes = data;
			debug && console.log("Dishes loaded");
			for (var i = 0; i < items.length; i++) {
				items[i].id = i;
			}
			UIQueue();
			UIdisplayIngredients(items, cmpFunctions[cmpSelector]);
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
function UIdisplayIngredients(items) {
	var cmpf = cmpFunctions[cmpSelector];

	while (ingredientList.firstChild) {
		ingredientList.removeChild(ingredientList.firstChild);
	}
	items.sort(cmpf);
	for (var i = 0; i < items.length; i++) {
		var d = myCreateElement('div', {
			className: 'sq ing',
			innerHTML: htmlIngredient(items[i])
		});

		(function() {
			var ci = i;
			d.getElementsByTagName("img")[0].onclick = function() {
				addToQueue(items[ci]);
			};
		})();
		// If we meet a new type/name/effect, add a separator
		// For names, only sort by first letter.
		if (i == 0) {
			if (cmpSelector == "name")
				UIaddSeparator(items[i].name[0]);
			else if (cmpSelector == "type")
				UIaddSeparator(items[i].type[0]);
			else
				UIaddSeparator(items[i][cmpSelector]);
		} else if (cmpf(items[i - 1], items[i]) != 0) {
			if (cmpSelector == "name") {
				if (items[i - 1].name[0] != items[i].name[0]) {
					UIaddSeparator(items[i].name[0]);
				}
			} else if (cmpSelector == "type") {
				UIaddSeparator(items[i].type[0]);
			} else {
				UIaddSeparator(items[i][cmpSelector]);
			}
		}
		ingredientList.appendChild(d);
	}
}

/*
 * Setting up queue GUI
 */
function UIQueue() {
	for (var i = 0; i < ingredients.length; i++) {
		(function() {
			var ci = i;
			ingredients[ci].onclick = function() {
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
	cmpSelector = sortSelect.value;
	UIdisplayIngredients(items);
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
 * Create a pseudo-ingredient from n ingredients of the same type.
 * We MUST use this function to be able to manipulate an ingredient
 *  later on when mixing them (because it has a fixed heart/dur/level).
 */
function repeatIngredient(ing, n) {
	var ning = {};

	if (ing === null || n === undefined || n <= 0 || n > 5)
		return null;
	ning.name = ing.name;
	ning.type = ing.type;
	ning.hearts = ing.hearts[n - 1];
	ning.effect = ing.effect;
	ning.duration = ing.duration[n - 1];
	ning.level = ing.level[n - 1];
	ning.image = ing.image;
	return ning;
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
