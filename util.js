'use strict';

/*
 * Compare ingredients by name
 */
function compareIngredientsByName(a, b) {
	return strcmp(a.name, b.name);
}

/*
 * Compare ingredients by effect
 */
function compareIngredientsByEffect(a, b) {
	return strcmp(a.effect, b.effect);
}

/*
 * Compare ingredients by type
 */
function compareIngredientsByType(a, b) {
	return strcmp(a.type, b.type);
}

/*
 * Compare ingredients by type (primitive type)
 */
function compareIngredientsBytYpe(a, b) {
	return strcmp(a.type[0], b.type[0]);
}

/*
 * strcmp
 */
function strcmp(a, b) {
	return (a > b ? 1 : 
			a < b ? -1 : 0);
}

/*
 * Creates a DOM element with the given attributes
 */
function myCreateElement(tag, attr) {
	var e = document.createElement(tag);

	for (var key in attr) {
		if (!attr.hasOwnProperty(key)) continue;
		e[key] = attr[key];
	}
	return e;
}

/*
 * Returns true if the dish has an active effect
 */
function hasEffect(dish) {
	return (dish.effect != "none" && dish.effect != "cancelled");
}