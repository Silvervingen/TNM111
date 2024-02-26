// size of window
var width = 400, height = 400
// used to check information of the node we clicked
var node_clicked = "";
// minimum apperances for the characters 
var min_apperances = 1;

// Creates node and links arrays
var nodes = [];
var links = [];

var nodes2 = [];
var links2 = [];
	
// Wich episode that will be shown, all episodes are true from beginging
var showEpisode = [true,true,true,true,true,true,true];

// scales for the links and nodes
var min_width = 2, link_scale = 0.1, min_radius = 5, node_scale = 0.2;

var leftData = {
	nodes: [],
	links: []
};
var rigthData = {
	nodes: [],
	links: []
};

var Tooltip = d3.select(".container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
	.style("position", "absolute")
    .style("padding", "5px");

//create a simulation for the simulation 1 and 2. 
var simulation1 = d3.forceSimulation(nodes);
var simulation2 = d3.forceSimulation(nodes2);

function loadData() {
	d3.selectAll("g").selectChildren().remove();
	// stop the simulation to make it posible to update the data
	simulation1.stop();
	simulation2.stop();

	leftData.nodes = [];
	leftData.links = [];
	
	rigthData.nodes = [];
	rigthData.links = [];

	//load all data
	Promise.all([
	  d3.json("/starwars-interactions/starwars-episode-1-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-2-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-3-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-4-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-5-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-6-interactions-allCharacters.json"),
	  d3.json("/starwars-interactions/starwars-episode-7-interactions-allCharacters.json")
	]).then(function (data) {
		// create a copy of data 
		copy_of_data = data;
		// add the data to the left graph from the choosen episodes
		data.forEach((episodeData, episodeIndex) => {
			// Filter out what episodes should be added to left graph
			if (showEpisode[episodeIndex]) {
			episodeData.nodes.forEach(node => {
				const nodeFound = leftData.nodes.findIndex(elem => elem.name === node.name);
				if (nodeFound === -1) {
				leftData.nodes.push(node); // add node to left graph if not already here
				}
			});
			}
		});
		// Finding links connections
	data.forEach((episodeData, episodeIndex) => {
		if (showEpisode[episodeIndex]) {
			episodeData.links.forEach(link => {
				const linkSource = leftData.nodes.findIndex(elem => elem.name === episodeData.nodes[link.source].name);
				const linkTarget = leftData.nodes.findIndex(elem => elem.name === episodeData.nodes[link.target].name);
	
				if (linkSource === -1 || linkTarget === -1) {
					// The link belongs to a filtered node
					console.log("skipped link");
					return;
				}

				const linkFound = leftData.links.findIndex(elem => (elem.source === linkSource && elem.target === linkTarget) || (elem.source === linkTarget && elem.target === linkSource));
				// if we dont find a new link we add source target and value to leftData
				if (linkFound === -1) {
					leftData.links.push({
						"source": linkSource,
						"target": linkTarget,
						"value": link.value
					});
				} 
				else { // if we find a link we already found, add one to the counter 
					leftData.links[linkFound].value += link.value;
				}
		  	});
		}
	});

	// Add the data to rigth graph. This works the same way as leftData but we do not check the episodeIndex, this means we take all episodes. We also has a counter for each character (else)
	copy_of_data.forEach((episodeData2) => {
		episodeData2.nodes.forEach(node => {
		const nodeFound2 = rigthData.nodes.findIndex(elem => elem.name === node.name);
		if (nodeFound2 === -1) {
			rigthData.nodes.push(node); // add node to rigth graph if not already here
		}
		else {
			rigthData.nodes[nodeFound2].value += node.value; // counting how many times characters occur in all movies
		}
		});
	});

				// Filtering for the right data
	// Filter out all nodes with lower apperances than choosen on the slider
	rigthData.nodes = rigthData.nodes.filter(node => node.value >= min_apperances);
	// Find links in the same way as for left data, row 82 to 108
	copy_of_data.forEach((episodeData2) => {		
		episodeData2.links.forEach(link => {
			const linkSource2 = rigthData.nodes.findIndex(elem => elem.name === episodeData2.nodes[link.source].name);
			const linkTarget2 = rigthData.nodes.findIndex(elem => elem.name === episodeData2.nodes[link.target].name);
			if (linkSource2 === -1 || linkTarget2 === -1) {
			// The link belongs to a filtered node
				console.log("skipped link");
				return;
			}
			const linkFound2 = rigthData.links.findIndex(elem => (elem.source === linkSource2 && elem.target === linkTarget2) || (elem.source === linkTarget2 && elem.target === linkSource2));
			if (linkFound2 === -1) {
				rigthData.links.push({
					"source": linkSource2,
					"target": linkTarget2,
					"value": link.value
				});
			} else {
				rigthData.links[linkFound2].value += link.value;
			}
		});
	});
	updateGraph(leftData, rigthData);
	});
}

function updateGraph(data1,data2) {
	//left
	nodes = data1.nodes; // copy nodes
    links = data1.links; // copy links
    simulation1 = d3.forceSimulation(nodes) // start force simulation with the nodes 
    	.force('charge', d3.forceManyBody().strength(-40)) // add a "strength" between the nodes
      	.force('center', d3.forceCenter(width, height)) // set the center of the simulation
      	.force('link', d3.forceLink().links(links)) // // Create links
     	.on('tick', function(d) {
        ticked('.nodes1', nodes, '.links1', links); // Update elements in the graph
    }).restart(); // recompute the forces and update the positions
	//console.log(nodes)
	
	//right
    nodes2 = data2.nodes;
    links2 = data2.links;	
    simulation2 = d3.forceSimulation(nodes2)
      	.force('charge', d3.forceManyBody().strength(-40))
      	.force('center', d3.forceCenter(width, height))
      	.force('link', d3.forceLink().links(links2))
      	.on('tick', function(d) {
        ticked('.nodes2', nodes2, '.links2', links2);
    }).restart(); 
	//console.log(nodes2)
}

function updateLinks(links_name, lnk) {
	// Select all line elements in the links_name selection
	const u = d3.select(links_name).selectAll('line').data(lnk);
	// Join the new data to the existing elements
	const lines = u.join('line').style('stroke-width', function(d) {
		return min_width + d.value * link_scale; // set line width 
	}) 
	// adding start & end point for each line
	.attr('x1', function(d) {
		return d.source.x;})
	.attr('y1', function(d) {
		return d.source.y;})
	.attr('x2', function(d) {
		return d.target.x;})
	.attr('y2', function(d) {
		return d.target.y;})
	return lines;
}

function updateNodes(nodes_name, nd) {
	// Select all circle elements in the nodes_name selection
	const u = d3.select(nodes_name)
		.selectAll('circle')
	  	.data(nd);
	// Join the new data to the existing elements
	const circles = u.join('circle')
	// set attributes, rdius, color, coordinates, name and apperaances(value), and border radius
	.attr('r', function(d) { // radie attribute
		return min_radius + d.value * node_scale*0.13;})
	.attr('fill', function(d) {
		return d.colour;})
	.attr('cx', function(d) { // the circle x-coordinate
		return d.x;})
	.attr('cy', function(d) { // the circle y-coordinate
		return d.y;})
	.attr('name', function(d) {
		return d.name;})
	.attr('value', function(d) {
		return d.value;})
	.attr("stroke", "black")
	// Hover function
	.on("mouseover", function() {
		Tooltip.style('opacity', 1)
		d3.select(this)
		.style("stroke", "yellow")
	})
	// write information on hover
	.on("mousemove", function(d) {
		Tooltip.html(d3.select(this).attr('name') + " has " + d3.select(this).attr('value') + " scene appearance ")
		.style("left", d.pageX + 20 + "px")
		.style("top", d.pageY - 40 + "px")
	})
	// remove information when we dont hover anymore
	.on("mouseleave", function() {
		Tooltip.style("opacity", 0)
		.style("left", -100 + "px") // bug fix, cant click on all if we dont haave it
		.style("top",  -100 + "px") // change pos so it does not block clickable nodes
		d3.select(this)
		.style("stroke", "black")
	})
	// when we click on a node
	.on("click", function() {
		// if we dont click on the alreaady selected node
		if (node_clicked != d3.select(this).attr('name')) {
			node_clicked = d3.select(this).attr('name')
			// if connected to the choosen node, keep line, else do not
			d3.selectAll('line').attr('opacity', function(d){
				if(d.source.name === node_clicked || d.target.name === node_clicked){ return 1; }
				else { return 0; }
			})
			// return color for the lines
			d3.selectAll('line').attr('stroke', function(d){
				if(d.source.name === node_clicked || d.target.name === node_clicked){ return 'orange' }
			})
		} else {
			node_clicked = "" // remove node selection
			// take back all the lines with correct color
			d3.selectAll('line').attr('stroke', '#333');
			d3.selectAll('line').attr('opacity', .5);
		}
	});
	// Return the circles for chaining
	return circles;
}
function ticked(nodes_name,nd,links_name,lnk) {
	updateLinks(links_name,lnk)
	updateNodes(nodes_name,nd)
}
//set showEpisode to false if true and true if false
function checkbox(checkbox) {
	showEpisode[checkbox.id] = !showEpisode[checkbox.id]
	loadData();
}
// set min_apperances to the choosen slider value
function slider(slider){
	d3.select('#slidertext').html(slider.value)
	min_apperances = slider.value;
	loadData();
}