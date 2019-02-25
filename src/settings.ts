
module powerbi.extensibility.visual {
    "use strict";

  import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;


  export type ColorFillType = 'solid' | 'gradient2'
  export class VisualSettings extends DataViewObjectsParser {
    // Names have to match 'capabilities.json'
    public color: ColorSettings = new ColorSettings();
    public xAxis: XAxisSettings = new XAxisSettings();
  }

  export class ColorSettings {
    public fillType: ColorFillType = 'solid'
    public fill: string = '#880000'
    public min: string = '#ffffff'
    public max: string = '#880000'
  }

  export class XAxisSettings {
    public show: boolean = true
  }

  export class ChartSettings {
    
  }

}