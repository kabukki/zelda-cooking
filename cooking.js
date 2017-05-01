/*
 * Lucien Le Roux - 09/04/17
 */

'use strict';

/*
 *	TODO
 *  - Bug: ingredients hearty annules ont toujours leur effet.
 *	- Todo: trouver les proprietes de nouveaux ingredients.
 *	- Todo: trouver les images correspondant aux effets.
 *  - Todo: page referencant tous les ingredients d'un type donne (encyclopedia.html?type=fruit)
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
	, sortSelect = document.getElementById('sortSelect')
	// Popup
	, popupOverlay = document.getElementsByClassName('popup-overlay')[0]
	, pdishImage = document.querySelector('#popup .dishImage')
	, pdishTitle = document.querySelector('#popup .dishTitle')
	, pdishDesc = document.querySelector('#popup .dishDesc')
	, pdishType = document.querySelector('#popup #dishType')
	, pdishEffect = document.querySelector('#popup #dishEffect')
	// Popup table
	, pdishHearts = document.querySelector('#popup #dishHearts')
	, pdishDuration = document.querySelector('#popup #dishDuration')
	, pdishLevel = document.querySelector('#popup #dishLevel')
	, pdishCertified = document.querySelector('#popup #dishCertified')
	, pdishRelated = document.querySelector('#popup #dishRelated');

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
 * POPUP
 */

function setType(ing) {
	while (pdishType.firstChild)
		pdishType.removeChild(pdishType.firstChild);
	pdishType.appendChild(myCreateElement("h3", {
		innerHTML: 'Type Tree:'
	}));
	for (var i = 0; i < ing.type.length; i++) {
		pdishType.appendChild(myCreateElement("div", {
			innerHTML: Array(i + 1).join('-') + '> ' + htmlType(ing.type[i]) + (i == 0 ? ' (parent type)' : '')
		}));
	}
}

/*
 * Fills a given row (DOM) from 'table' the data in the array 'data'
 * If 'transformFunction' is given, applies it to every member of 'data' before displaying it.
 * Removes any data that was previously on this row
 */
function setRow(row, title, data, transformFunction) {
	while (row.firstChild)
		row.removeChild(row.firstChild);
	row.appendChild(myCreateElement("td", {innerHTML: title}));
	for (var i = 0; i < data.length; i++) {
		row.appendChild(myCreateElement("td", {
			innerHTML: transformFunction ? transformFunction(data[i]) : data[i]
		}));
	}
}

function setRelated(ing) {
	var recipes = getRelatedRecipes(dishes, ing);

	while (dishRelated.firstChild)
		pdishRelated.removeChild(pdishRelated.firstChild)
	if (recipes.length == 0) {
		pdishRelated.appendChild(myCreateElement("h3", {
			innerHTML: 'No known recipe uses this ingredient.'
		}));
	} else {
		pdishRelated.appendChild(myCreateElement("h3", {
			innerHTML: 'Appears in ' + recipes.length + ' recipes:'
		}));
		recipes.sort(cmpFunctions.name.compareFull);
		for (var i = 0; i < recipes.length; i++) { // Loop every recipe in subtype => apple: Apple pie, ... ; any: simmered fruit, mushroom mix, ...
			pdishRelated.appendChild(myCreateElement("div", {
				className: 'dish-sm',
				innerHTML: 	'<div class="dishHeader">' +
								'<span class="dishImage">' +
									'<img src="img/food/' + recipes[i].image + '"/>' +
								'</span>' + '<span class="dishTitle">' +
									recipes[i].name +
								'</span>' +
							'</div>' +
							'<div class="dishDesc">' +
								'<strong>Recipe</strong>: ' + recipes[i].required.map(function(item) { return htmlType(item); }).join(' + ') +
									(recipes[i].excluded ? ' (except: ' + recipes[i].excluded.join(', ') + ')' : '') +
							'</div>'
			}));
		}
	}
}

function UIdisplayIngredientInfo(ing) {
	var effectTransform;

	if (!ing) return ;
	effectTransform = getEffectTransform(ing.effect);

	pdishImage.innerHTML = '<img src="img/food/' + ing.image + '"/>';
	pdishTitle.innerHTML = ing.name;
	setType(ing);
	pdishEffect.innerHTML = 'Effect: ' + htmlEffect(ing) + ' ' + ing.effect;
	pdishDesc.innerHTML = ing.description || 'No description.';
	setRow(pdishHearts, "Hearts Healed", ing.hearts, htmlHearts);
	setRow(pdishDuration, getEffectDescription(ing.effect), ing.duration, effectTransform); 
	// Only display effect level if it's a regular one (timed)
	if (hasRegularEffect(ing))
		setRow(pdishLevel, "Effect Level", ing.level, null);
	pdishCertified.innerHTML = ing.certified ?
		'<i class="fa fa-star"></i> This ingredient has been thoroughly tested.' :
		'<i class="fa fa-exclamation-circle"></i> This ingredient has not been fully tested yet.';
	setRelated(ing);
}

function UIopenPopup(ing) {
	document.body.classList.toggle('noscroll');
	popupOverlay.scrollTop = 0;
	popupOverlay.style.visibility = 'visible';
	popupOverlay.style.opacity = 1;
	UIdisplayIngredientInfo(ing);
}

function UIclosePopup() {
	document.body.classList.toggle('noscroll');
	popupOverlay.style.visibility = 'hidden';
	popupOverlay.style.opacity = 0;
}

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
			var d = myCreateIngredient(items[i]);
			d.getElementsByTagName("img")[0].onclick = function() { addToQueue(items[ci]); };

			if (i == 0 || cmpf.compareSimple(items[i - 1], items[i]) != 0)
				UIaddSeparator(cmpf.get(items[i]));
			ingredientList.appendChild(d);
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
popupOverlay.onclick = function(e) {
	if (e.target.className == 'popup-overlay')
		UIclosePopup();
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

/*********/
/* Queue */
/*********/

/*
 * Adds the ingredient to the queue, then refresh it
 */
function addToQueue(ing) {
	if (queue.length == 5) {
		debug && console.log('Queue is already full!');
	} else {
		queue.push(ing);
		refreshQueue();
	}
}

/*
 * Removes the nth ingredient from the queue, then refresh it
 */
function removeFromQueue(n) {
	if (n < 0 || n >= queue.length)
		return ;
	queue.splice(n, 1);
	refreshQueue();
}

/*
 * Refresh the DOM ingredients in the queue
 */
function refreshQueue() {
	for (var i = 0; i < 5; i++) {
		if (i < queue.length)  {
			(function() {
				var ci = i;
				var d = myCreateIngredient(queue[ci]);

				d.getElementsByTagName("img")[0].onclick = function() { removeFromQueue(ci); };
				ingredients[ci] = ingredients[ci].parentNode.replaceChild(d, ingredients[ci]);
			})();
		}
		else
			ingredients[i].innerHTML = '';
	}
	display(cook(queue));
}
