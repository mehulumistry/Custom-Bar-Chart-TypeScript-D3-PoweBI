module powerbi.extensibility.visual {

	export class TooltipVisual{
		private tooltipServiceWrapper: ITooltipServiceWrapper;

		constructor(options){
			this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
		}

		public addTooltip(itemSelected:d3.Selection<Element>){
			this.tooltipServiceWrapper.addTooltip(itemSelected,
				(tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
				(tooltipEvent: TooltipEventArgs<number>) => null);
		}

		private getTooltipData(toolTipItem: any): VisualTooltipDataItem[] {
			return [{
				displayName: toolTipItem.id,
				value: toolTipItem.tooltips.toString(),
				header: `${toolTipItem.id} Information`
			}
			];
		}

	}
}