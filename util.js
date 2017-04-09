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