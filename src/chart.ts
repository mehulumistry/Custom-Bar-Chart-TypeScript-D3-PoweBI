module powerbi.extensibility.visual {

	import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
	import CS = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
		/**
		 * 
		 * root(div)
		 * 	 wrapper(div)
		 *
		 *      top(div)
		 *          legend(g)
		 *          ......
		 *      bottom(div)
		 *          xAxis(g)
		 *          ......
		 *      content(div)
		 *
		 *             yAxis(div)
		 *              ......
		 *             container(div)
		 *
		 *                     items(g)
		 *                          item__list(g)
		 * 								pred(g)
		 * 									rect
		 *                           	    text
		 * 								hist(g)
		 *                               	rect
		 * 									text
		 *                               ......
		 *                      ......
		 *
		 *
		 */

	const Selectors = {
		wrapper: CS("wrapper"),
		topContent: CS("top_content"),
		bottomContent: CS("bottom_content"),
		content: CS("content"),
		legend: CS('legend'),
		xAxis: CS("x_axis"),
		yAxis: CS('y_axis'),
		container: CS('container'),
		items: CS('items'),
		currentDate: CS('current_date'),
		currentDateLine: CS('line__current_date'),
		eachItem: CS('item')
	}

	export class Chart {
	//	private tooltipServiceWrapper: ITooltipServiceWrapper;
		public wrapper: d3.Selection<HTMLElement>;
		private topContent: d3.Selection<SVGElement>;
		private bottomContent: d3.Selection<SVGElement>;
		private root: d3.Selection<SVGElement>;
		private container: d3.Selection<SVGElement>;
		private content: d3.Selection<SVGElement>;
		private legend: d3.Selection<SVGElement>;
		private xAxis: d3.Selection<SVGElement>;
		private yAxis: d3.Selection<SVGElement>;
		private items: d3.Selection<SVGElement>;
		private currentDate: d3.Selection<SVGElement>;
		private containerElement;
		private currentDateLine: d3.Selection<SVGElement>;
		private eachItem: d3.Selection<SVGGElement>

		private tooltip: TooltipVisual;

		constructor(options:VisualConstructorOptions){


			//TODO: convert it into selectors 

			this.root = d3.select(options.element);
			this.root.style({
				overflow: "hidden"
			});

			

			this.root = d3
				.select(options.element)
				.append("svg")
				.classed("root", true);

			// this.wrapper = this.root
			// 	.append("div")
			// 	.classed(Selectors.wrapper.className, true);

			this.topContent = this.root.append("g").classed(Selectors.topContent.className, true);
			this.legend = this.topContent.append("g").classed(Selectors.legend.className, true);

			this.bottomContent = this.root.append("g").classed(Selectors.bottomContent.className, true);
			this.xAxis = this.bottomContent.append("g").classed(Selectors.xAxis.className, true);

			this.content = this.root.append("g").classed(Selectors.content.className, true);

			this.yAxis = this.content.append("g").classed(Selectors.yAxis.className, true);

			//this.containerElement = this.content.append("div").classed("container", true);

			this.container = this.content.append("g").classed(Selectors.container.className, true);
			this.items = this.container.append("g").classed(Selectors.items.className, true);

		    this.currentDate = this.container.append("g").classed(Selectors.currentDate.className, true);

			this.tooltip = new TooltipVisual(options);
		}

		//FIXME: figure out how to make function and call from constrctor
		// public initElements(options: VisualConstructorOptions): void {

		// }
		public update(viewModel: ViewModel, viewport: IViewport, options: VisualSettings) : void {
			let dimensionSet: DimensionSet = this.setMarginsAndDimensions(viewport, options);
			this.draw(viewModel, dimensionSet);
			this.addTooltip();
		}

		public draw(viewModel: ViewModel, dimensionSet: DimensionSet): void {
			// let { dimensions, margins } = dimensionSet
			let {data:{list}, sourceMap: {sources,meta,grouped}} = viewModel
			//let data: VisualDataPoint[] = viewModel.data;
			let data: VisualDataPoint[] = list;
			let { xScale, yScale } = this.getScales(dimensionSet, viewModel);
			let {elementDimensions: {content}} = dimensionSet;
			const MS_TO_HOURS = (1000 * 60 * 60);

			//console.log(data.map(data => data.startTime));
			let ticks = data.map(data => xScale(data.startTime.valueOf() / MS_TO_HOURS));
			let xAxis: d3.svg.Axis = d3.svg
				.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(10)
				
				// .tickFormat(function (d:Date):string { 
				// 	console.log(d);
				// 	return d.getHours().toString(); 
				// })
								
			let yAxis: d3.svg.Axis = d3.svg
				.axis()
				.scale(yScale)
				.orient("left");
	

			this.xAxis.call(xAxis)
					
			this.yAxis.call(yAxis);

			//FIXME: current date is adding up
			
			let currentDateTime: Date = meta.currentDate;
			let currentDateLinePos: number = xScale(currentDateTime);

			
			let update$line = this.currentDate.selectAll(Selectors.currentDateLine.selectorName).data([currentDateTime]);

			
			let update$data = this.items.selectAll(Selectors.items.selectorName).data(data, d => d.id);
			let enter$date = update$data.enter();
			let exit$data = update$data.exit();
			let exit$line = update$line.exit();
			let $item = enter$date.append("g").classed(Selectors.items.className, true);
		
			// Create Children for prediction
			{
				let $item_prediction = $item.append("g").classed("item_prediction", true);
				$item_prediction.append("rect").classed("rect_prediction", true);
				$item_prediction.append("text").classed("label_prediction", true);

				// Create Children for historical
				let $item_historical = $item.append("g").classed("item_historical", true);
				$item_historical.append("rect").classed("rect_historical", true);
				$item_historical.append("text").classed("label_historical", true);

				$item_historical.style({ display: "block" });
				$item_prediction.style({ display: "block" });
			}
		
			update$data.each(function (this: SVGGElement, d: VisualDataPoint) {
				let $item: d3.Selection<SVGGElement> = d3.select(this);
				
				//let $label = $item.select(".label");
				
				if(d.kind === 'prediction'){
					
					let $item_pred: d3.Selection<SVGGElement>  = $item.select(".item_prediction");
					let $rect_pred: d3.Selection<SVGElement> = $item_pred.select('.rect_prediction');
				
					$rect_pred
						.attr({
							x: xScale(d.startTime.valueOf()),
							y: yScale(d.startMarker),
							width: xScale(d.endTime.valueOf()) - xScale(d.startTime.valueOf()),
							height: yScale(d.size)
						})
						.style({
							fill: "mediumpurple"
							//fill: "red"
							//opacity: d.color / 4
						});

				}
				if(d.kind === 'historical'){

					let $item_hist: d3.Selection<SVGGElement> = $item.select(".item_historical");
					let $rect_hist: d3.Selection<SVGElement>  = $item_hist.select('.rect_historical');

					$rect_hist
						.attr({
							x: xScale(d.startTime.valueOf()),
							y: yScale(d.startMarker),
							width: xScale(d.endTime.valueOf()) - xScale(d.startTime.valueOf()),
							height: yScale(d.size)
						})
						.style({
							fill: "lightseagreen"
							//fill: "red"
							//opacity: d.color / 4
						});


				}

				if(d.kind === 'total'){

					let $item_pred = $item.select(".item_prediction");
					let $rect_pred = $item_pred.select('.rect_prediction');
					let $item_hist = $item.select(".item_historical");
					let $rect_hist = $item_hist.select('.rect_historical');

					$rect_pred
						.attr({
							x: currentDateLinePos,
							y: yScale(d.startMarker),
							width: xScale(d.endTime.valueOf()) - currentDateLinePos,
							height: yScale(d.size)
						})
						.style({
							fill: "mediumpurple"
							//fill: "red"
							//opacity: d.color / 4
						});

					$rect_hist
						.attr({
							x: xScale(d.startTime.valueOf()),
							y: yScale(d.startMarker),
							width: currentDateLinePos - xScale(d.startTime.valueOf()),
							height: yScale(d.size)
						})
						.style({
							fill: "lightseagreen"
							//fill: "red"
							//opacity: d.color / 4
						});


				}
				// put condition 
				//let computedHeight: number = containerHeight - yScale(d.id);
				//TODO: take absolute value in boolard even if it is flip, see same for time
				

				// let labelGap: number = yScale(d.id) - margins.top;
				// let fontSize: number = 20;
				// $label
				// 	.attr({
				// 		x: xScale(d.id) + xScale.rangeBand() / 2,
				// 		y:
				// 			labelGap > fontSize
				// 				? yScale(d.id) - fontSize
				// 				: yScale(d.id) + fontSize
				// 	})
				// 	.text(d.id)
				// 	.style({
				// 		'font-size': fontSize
				// 	});
			});


			console.log("currentDateline", currentDateTime, currentDateLinePos,"xScale: ", xScale(currentDateTime));

			update$line.enter().append("line")
				.classed(Selectors.currentDateLine.className, true);


			update$line.each(function (this: SVGElement){
				let $line = d3.select(this);
				$line.attr({
					x1: d => xScale(d),
					x2: d => xScale(d),
					y1: 0,
					y2: content.height
				})
				.style({
					stroke: 'black',
					"stroke-width": '5px',
					"stroke-dasharray": "4 4",
					display: "block"
				});

			});

			
			exit$line.remove();
			exit$data.remove();
		}
		public setMarginsAndDimensions(viewport: IViewport, options: VisualSettings): DimensionSet {

			let {
				xAxis: xAxisOptions
			} = options
			let dimensions = {
				height: viewport.height,
				width: viewport.width
			};

			let margins = {
				top: 30,
				bottom: 30,
				left: 40,
				right: 80
			};

			
			if (xAxisOptions.show){
				margins.bottom += 0 // Size of xAxis
			}

			this.root.attr({
				width: `${dimensions.width}px`,
				height: `${dimensions.height}px`
			});

			this.bottomContent.attr({
				transform: `translate(0 ${dimensions.height -
					margins.bottom})`
			});

			this.topContent.attr({});

			this.content.attr({
				transform: `translate(0 ${margins.top})`
			});

			// this.xAxis.attr({
			//     transform: `translate(${this.margins.top} 0)`
			// })

			this.yAxis.attr({
				transform: `translate(${margins.right} 0)`
			});


			let elementDimensions = {
				content: {
					width: dimensions.width - margins.left,
					height: dimensions.height - margins.top - margins.bottom
				},
				xAxis: {
					width: dimensions.width,
					height: dimensions.height - margins.top
				},
				yAxis: {
					width: margins.left,
					height: dimensions.height - margins.top - margins.bottom
				},
				topContent: {
					width: dimensions.width,
					height: margins.top
				}

			}


			return {margins,dimensions,elementDimensions} as DimensionSet
		}

		public getScales(dimensionSet:DimensionSet, viewModel: ViewModel): Scales {

			let { data :{list}, sourceMap: { sources, meta, grouped } } = viewModel
			let data:VisualDataPoint[] = list;
			let {elementDimensions : {content}} = dimensionSet
			const MS_TO_HOURS = (1000 * 60 * 60);
			let minXValue: Date = new Date((Math.min(...data.map(data => data.startTime.valueOf()))));
			let maxXValue: Date = new Date((Math.max(...data.map(data => data.endTime.valueOf()))));

			//FIXME: uncomment this
			// let minXValue: Date = new Date(meta.ranges.startTime[0]);
			// let maxXValue: Date = new Date(meta.ranges.startTime[1]);
			let xDomain: Pair<Date> = [minXValue,maxXValue]; 

			let xRange: [number, number] = [dimensionSet.margins.right, dimensionSet.dimensions.width];
			let yDomainValues: Pair<number> = [0, Math.max(...data.map(data => data.endMarker))];

			let xScale: d3.time.Scale<number, number> = d3.time
				.scale<number>()
				.domain(xDomain)
				.range(xRange)
				.nice()
				
			console.log("content height",content.height);
			let yScale: d3.scale.Linear<number, number> = d3.scale
				.linear<number>()
				.domain(yDomainValues)
				.range([0, content.height])
				.nice()

			
			return { xScale, yScale }
		}

		public addTooltip(){
			this.tooltip.addTooltip(this.items.selectAll(Selectors.items.selectorName));
		}
	}

	
}