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

/*
 * Disassembles a compound type and returns
 * an array containing every primitive type of the dish.
 */
function getTypes(ctype) {
	var	typenames = [];

	for (var key in types) {
		if (ctype & types[key]) {
			if (ctype != types[key]) {
				console.log(key + ' is a related type')
				if (ctype > types[key]) {
					console.log(key + ' is a parent type')
				}
			}
			typenames.push(key);
		}
		//ctype >> 1;
	}
	return typenames;
}