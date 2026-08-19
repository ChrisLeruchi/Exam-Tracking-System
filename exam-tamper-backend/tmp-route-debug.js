import app from './src/app.js'
const stack = app._router?.stack || []
function describeLayer(layer, prefix='') {
  const route = layer.route ? `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}` : ''
  const name = layer.name || '<anonymous>'
  const regexp = layer.regexp ? layer.regexp.source : ''
  console.log(`${prefix}${name}${route ? ' => ' + route : ''}${regexp ? ' ['+regexp+']' : ''}`)
  if (layer.handle && layer.handle.stack) {
    layer.handle.stack.forEach((inner) => describeLayer(inner, prefix + '  '))
  }
}
stack.forEach(layer => describeLayer(layer))
