module powerbi.extensibility.visual {

  export type Pair<T> = [T, T]
  export type ObjectMap<T> = { [key: string]: T };
  export type Dictionary<T> = Partial<ObjectMap<T>>;


  export interface VisualDataPoint {
    id: string;
    startMarker: number;
    endMarker: number;
    startTime: number;
    endTime: number;
    size: number;
    duration: Duration;
    kind: DurationType // kind of duration
    tooltips?: string[]
  }

  export interface VisualDataPointRaw {
    [key: string]: number
  }
  // export interface Range {
  //   min: number
  //   max: number
  // }

  export type NumberRange = Pair<number>

  export interface VisualData {
      list: VisualDataPoint[]
      map: VisualDataPointMap
  }

  export interface ViewModel {
    sourceMap: SourceMapWithMeta
    //data: VisualDataPoint[];
    data: VisualData

  }

  

  export interface VisualDataPointMap {
    [key: string]: number[]
  }

  export type DataViewColumn = DataViewCategoryColumn | DataViewValueColumn;

  export interface SourceMap extends Dictionary<DataViewColumn | undefined> {
    [key: string]: DataViewColumn;
  }

  export interface GroupedSourceMap extends Dictionary<DataViewColumn[] | undefined> {
    tooltips?: DataViewColumn[];
  }

  export interface SourceMapWithMeta {
    sources: SourceMap;
    grouped: GroupedSourceMap;
    meta?: MetaData;
  }


  export interface MetaData {
    currentDate: Date;
    ranges: RangeMap
  }

  export interface RangeMap {
    startMarker: Pair<number>
    startTime: Pair<number>
    endMarker: Pair<number>
    endTime: Pair<number>
    historical: Pair<number>
    predictive: Pair<number>
    size: Pair<number>
    total: Pair<number>
  }

  export interface Margins {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }

  export interface Dimensions {
    width: number;
    height: number;
  }

  export interface ToolTipDataItem {
    displayName: string;
    value: string;
  }

  export interface ElementDimensions{

    [key:string]: {
      width: number,
      height: number,
      x?: number,
      y?: number
    }

  }

  export interface DimensionSet {
    dimensions: Dimensions,
    margins: Margins,
    elementDimensions?: ElementDimensions
  }
  export interface Scales {
    xScale: any;
    yScale: d3.scale.Linear<any, any>
  }

  export interface Axis {
    [key:string] : d3.svg.Axis
  }

  export interface Duration {
    startDuration?: number,
    totalDuration: number,
    endDuration?: number
  }

  export type DurationType = 'historical' | 'prediction' | 'total';
}
