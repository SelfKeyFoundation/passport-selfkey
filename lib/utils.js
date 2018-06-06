'use strict'

exports.lookup = (obj, field) => {
	if (!obj) return null
	const chain = field.split(']').join('').split('[')
	for (let i = chain.length - 1; i >= 0; i--) {
		let prop = obj[chain[i]]
		if (typeof(prop) === 'undefined') return null
		if (typeof(prop) !== 'object') return prop
		obj = prop
	}
	return null
}
