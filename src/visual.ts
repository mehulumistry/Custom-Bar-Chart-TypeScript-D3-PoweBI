module powerbi.extensibility.visual {
  "use strict";
  export class Visual implements IVisual {

    private host: IVisualHost;
    private settings: VisualSettings;
    private transformer: VisualTransformer;
    private chart: Chart;

    private viewModel?: ViewModel
    
    constructor(options: VisualConstructorOptions) {
      this.transformer = new VisualTransformer();
      this.chart = new Chart(options);
      this.host = options.host
      this.settings = new VisualSettings()
    }

    public update(options: VisualUpdateOptions): void {
      // if ((options.type & VisualUpdateType.Resize) === VisualUpdateType.Resize) {
      //   return
      // }
      
      console.log('Data Change:', options.operationKind, {
        'Append': VisualDataChangeOperationKind.Append,
        'Create': VisualDataChangeOperationKind.Create
      })

      console.log('Update Type', options.type, {
        'All': VisualUpdateType.All,
        'Data': VisualUpdateType.Data,
        'Resize': VisualUpdateType.Resize,
        'ResizeEnd': VisualUpdateType.ResizeEnd,
        'Style': VisualUpdateType.Style,
        'ViewMode': VisualUpdateType.ViewMode
      })

      
      if ((options.type & VisualUpdateType.ResizeEnd) === VisualUpdateType.ResizeEnd) {
        console.log('Resize has ended!')
      }

      let dataChanged: boolean = (options.type & VisualUpdateType.Data) === VisualUpdateType.Data || isUndefined(this.viewModel)

      let dataView: DataView | undefined = this.getDataView(options);
      if (!dataView) return;

      this.settings = VisualSettings.parse<VisualSettings>(dataView);

      let viewModel: ViewModel
      // if(dataChanged){
      viewModel = this.transformer.transform(dataView)
       // this.viewModel = viewModel
      // } else {
      //   viewModel = this.viewModel
      // }
      
      console.log("viewModel",viewModel);
      if(!viewModel) return;
      this.chart.update(viewModel, options.viewport, this.settings)
    }

    public getDataView(options: VisualUpdateOptions): DataView | undefined {
      let dataView: DataView = options.dataViews[0];
      if (isDataViewValid(dataView)) {
        return undefined;
      } else return dataView;
    }
    public enumerateObjectInstances(
      options: EnumerateVisualObjectInstancesOptions
    ): VisualObjectInstanceEnumeration {
      let objectName = options.objectName;
      let properties: VisualObjectInstanceEnumeration = [];
      
      // console.log("form enumerate",options);
      switch (objectName) {
        case "color":
          {
            let colorProperties: ObjectMap<DataViewPropertyValue> = {}
            
            let { color: colorOptions } = this.settings

            colorProperties.fillType = colorOptions.fillType

            if(colorOptions.fillType === 'solid'){
              colorProperties.fill = colorOptions.fill
            } else {
              colorProperties.min = colorOptions.min
              colorProperties.max = colorOptions.max
            }

            properties.push({
              objectName,
              selector: null as any,
              properties: colorProperties
            });
          }
          break;
        default: {
          properties = VisualSettings.enumerateObjectInstances(
            this.settings || VisualSettings.getDefault(),
            options
          );
        }
      }
      return properties;
    }
  }
}
