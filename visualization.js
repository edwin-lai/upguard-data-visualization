/* eslint no-unused-vars: 0 */
/* global $, d3 */

var processInfo = function () {
  var serviceAPIKey = document.getElementById('service-api-key').value
  var secretKey = document.getElementById('secret-key').value
  var nodeName = document.getElementById('node-name').value
  $.ajax({
    url: 'https://app.upguard.com/api/v2/nodes/lookup.json?name=' + nodeName,
    headers: {
      Authorization: 'Token token="' + serviceAPIKey + secretKey + '"',
      Accept: 'application/json'
    },
    dataType: 'json',
    method: 'GET',
    success: function (data) {
      getScanData(data['node-id'], nodeName)
    },
    error: function () {
      console.log('error')
    }
  })
}

var getScanData = function (nodeId, nodeName) {
  var serviceAPIKey = document.getElementById('service-api-key').value
  var secretKey = document.getElementById('secret-key').value
  $.ajax({
    url: 'https://app.upguard.com/api/v2/nodes/' + nodeId + 'scan_details',
    headers: {
      Authorization: 'Token token="' + serviceAPIKey + secretKey + '"',
      Accept: 'application/json'
    },
    dataType: 'json',
    method: 'GET',
    success: function (returnedData) {
      var hierarchy = buildHierarchy(JSON.parse(returnedData.data), nodeName, 'null')
      visualize(hierarchy)
    },
    error: function () {
      console.log('error')
    }
  })
}

var buildHierarchy = function (data, nodeName, parent) {
  var hierarchy = {
    name: nodeName,
    parent: parent
  }
  for (var key in data) {
    if (data.hasOwnProperty('record type') || key === 'description') {
      continue
    }
    if (data.hasOwnProperty(key)) {
      if (typeof data[key] === 'object') {
        (hierarchy.children || (hierarchy.children = []))
          .push(buildHierarchy(data[key], key, nodeName))
      } else if (true) {
        (hierarchy.children || (hierarchy.children = []))
          .push({
            name: key === 'value' ? data[key] : key + ': ' + data[key],
            parent: nodeName
          })
      }
    }
  }
  return hierarchy
}

var visualize = function (hierarchy) {
  var diameter = 1024

  var tree = d3.layout.tree().size([360, diameter / 2 - 120])
    .separation(function (node1, node2) {
      return (node1.parent === node2.parent ? 1 : 2) / node1.depth
    })

  var diagonal = d3.svg.diagonal.radial().projection(function (d) {
    return [d.y, d.x / 180 * Math.PI]
  })

  var svg = d3.select('svg').attr('width', diameter * 1.5)
    .attr('height', diameter * 1.2).append('g')
    .attr('transform', 'translate(' + diameter * 0.6 + ',' + diameter * 0.6 + ')')

  var nodes = tree.nodes(hierarchy)
  var links = tree.links(nodes)

  var link = svg.selectAll('.link').data(links).enter().append('path')
    .attr('class', 'link').attr('d', diagonal)

  var node = svg.selectAll('.node').data(nodes).enter().append('g')
    .attr('class', 'node')
    .attr('transform', function (d) {
      return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')'
    })

  node.append('circle').attr('r', 4.5)

  node.append('text').attr('dy', '.31em').attr('text-anchor', function (d) {
    return d.x < 180 ? 'start' : 'end'
  }).attr('transform', function (d) {
    return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)'
  }).text(function (d) {
    return d.name
  })

  d3.select(this.frameElement).style('height', diameter - 150 + 'px')
}
