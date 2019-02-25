
module powerbi.extensibility.visual {
  export class VisualTransformer {
    public getSourceMapWithMeta(dataView: DataView): SourceMapWithMeta | undefined {
      let sources: SourceMap = {};
      let grouped: GroupedSourceMap = {};

      let groupedRoles = ["tooltips"];

      //TODO: make general funciton for checking it.
      // if(!isDataViewValid(dataView)){
      //   return
      // }

      if (isUndefined(dataView.categorical) || isUndefined(dataView.categorical.categories) || isUndefined(dataView.categorical.values)){
        return undefined;
      }
      let categoriesList: DataViewColumn[] = dataView.categorical.categories;
      let valuesList: DataViewColumn[] = dataView.categorical.values;
      
      //let data: VisualDataPoint[] = [];

      categoriesList.forEach(category => {
        //TODO: remove below isUndefined
        if (isEverySet(category, category.source, category.source.roles) && !isUndefined(category.source.roles)) {
          let roles = Object.keys(category.source.roles);
         
          roles.forEach(role => {
            //data[role] = category.values;
            sources[role] = category;
          });
        }
      });
      
      type KeyedObjectMap<K extends string, T> = { [key in K] : T}
      type KeyedDictionary<K extends string, T> = Partial<KeyedObjectMap<K, T>>
      // type VisualDataPointKeys = keyof VisualDataPoint
      // type RolesCountMap = KeyedDictionary<VisualDataPointKeys, number>

      let rolesCount: VisualDataPointRaw = {};

      // TODO: Example, can be removed
      // let strings: (keyof VisualDataPoint)[] = ['one', 'id', 'displayTime1']
      // strings.forEach(string => d[string] = '')

      valuesList.forEach(value => {
        if (isEverySet(value, value.source, value.source.roles) && !isUndefined(value.source.roles)) {
          let roles: string[] = Object.keys(value.source.roles);
        
          roles.forEach(role => {
            if (groupedRoles.includes(role)) {
              grouped[role] = !isUndefined(grouped[role])
                ? [...grouped[role], value]
                : [value]

              // TODO: Compare code styles pros/cons  
              // if (!grouped[role]) {
              //   grouped[role] = [value];
              // } else {
              //   grouped[role].push(value);
              // }
            } else {            
              if(role in sources){
                let count = rolesCount[role] + 1;
                sources[`${role}${count}`] = value;  
              }
              else {
                sources[role] = value;
                rolesCount[role] = 1
              }
              //data[role] = value.values;
            }
          });
        }
      });
      let sourcesWithMeta: SourceMapWithMeta = {
        sources,
        grouped
      };
      return sourcesWithMeta;
    }
    public renameSourceMap(sourceMapRaw:SourceMapWithMeta):SourceMapWithMeta {
      
      let {sources, grouped} = sourceMapRaw
      const renameSource = {
        displayTimes: 'startTime',
        displayTimes2: 'endTime',
        markers: 'startMarker',
        markers2: 'endMarker'
      };
      let sourcesEntries:[string,DataViewColumn][] = Object.entries(sources);
      
      let newSources:SourceMap = {}
      function nestedKey(sourcesEntries) {
        let oldkey:string = sourcesEntries[0];
        let newKey:string = renameSource[oldkey];
        if(isUndefined(newKey)){
          newKey = oldkey
        }
        sourcesEntries[0] = newKey;
        newSources[newKey] = sourcesEntries[1];
      }
      sourcesEntries.forEach(nestedKey);
      let renameSourceMap: SourceMapWithMeta= {sources: newSources,grouped: grouped}
      //console.log("arr",renameSourceMap);    
      return renameSourceMap;
    }

  //   public getMetaData(sourceMap: SourceMapWithMeta): SourceMapWithMeta{

  //     let { sources } = sourceMap;

  //     let {
  //       sources: { id, startMarker, endMarker, startTime, endTime }
  //     } = sourceMap;

  //     let meta: MetaData = {}
  //     for (let i = 0;i < id.values.length;i++) {

  //       // calculate the duration and size
  //       startTime.values[i] = castToDate(startTime.values[i]);
  //       endTime.values[i] = castToDate(endTime.values[i]);

  //       isNumber(startMarker.values[i]);

  //       //TODO: make one property in meta to show the direction and calculate accordingly
  //       let start_marker: number = Math.abs(Math.max(startMarker.values[i]));
  //       let end_marker: number = Math.abs(Math.max(endMarker.values[i] as number, 0));
  //       let size: number = Math.abs(end_marker - start_marker);
  //       let start_time: number = Math.max(startTime.values[i].valueOf() as number, 0);
  //       let end_time: number = Math.max(endTime.values[i].valueOf() as number, 0);

  //       let current_time: number = this.getCurrentDate(sources).valueOf();


  //       let kindOfDuraion: number = 1;
   
       
  //       return null;
  //     }
  // }

    public transformDataPoints(
      sourceMap: SourceMapWithMeta
    ): [VisualData,SourceMapWithMeta]{

      let { sources, grouped } = sourceMap;

      let {
        sources: { id, startMarker, endMarker, startTime, endTime},
        grouped: { tooltips }
      } = sourceMap;
            
      let meta: MetaData;
      let rangeMap: RangeMap;
      let d: Partial<VisualDataPoint>;
      let datalist: VisualDataPoint[] = [];
      let datalistMap: VisualDataPointMap;

      const MS_TO_HOURS = (1000 * 60 * 60);
      let currentDuration: Date = this.getCurrentDate(sources);
      for (let i = 0; i < id.values.length; i++) {

        // calculate the duration and size
        startTime.values[i] = castToDate(startTime.values[i]);
        endTime.values[i] = castToDate(endTime.values[i]);
        
        isNumber(startMarker.values[i]);
       
        //TODO: make one property in meta to show the direction and calculate accordingly
        let start_marker: number = Math.abs(Math.max(startMarker.values[i] as number,0));
        let end_marker: number = Math.abs(Math.max(endMarker.values[i] as number, 0));
        let size: number = Math.abs(end_marker - start_marker);
        let start_time: number = Math.max(startTime.values[i].valueOf() as number,0);
        let end_time: number = Math.max(endTime.values[i].valueOf() as number, 0);
        let current_time: number = currentDuration.valueOf();
        // 1 for historical, 2 for prediction, 3 for middle
        let typeOfDuration: DurationType;
        let durationType: DurationType = current_time > end_time ? 'historical' : current_time < start_time ? 'prediction' : 'total';
        let duration: Duration = {
          startDuration: current_time - start_time,
          totalDuration: end_time - start_time,
          endDuration: end_time - current_time
        };

        d = {
          id: id.values[i] as string,
          startMarker: startMarker.values[i] as number,
          endMarker: endMarker.values[i] as number,
          size: size,
          startTime: start_time as number,
          endTime: end_time as number,
          duration: duration,
          kind: durationType
          //TODO: add tooltips in future
         // tooltips: tooltips.map(tooltip => tooltip.values[i]) as string[]
        };        
        isVisualDataPoint(d) && datalist.push(d);

        //  console.log(d.tooltips.map((tooltip, i) => ({
        //      displayName: tooltips[i].source.displayName,
        //      value: tooltip
        //  })))
      }

      meta = {
        currentDate: currentDuration,
        ranges: rangeMap
      }

      sourceMap = {
        sources, grouped, meta
      }
      let flatdata:[SourceMapWithMeta,VisualDataPointMap] = this.getFlatData(datalist,sourceMap)
      let sourceMapWithMeta: SourceMapWithMeta = flatdata[0];
      datalistMap = flatdata[1];
      
      let data: VisualData = {
        list: datalist,
        map: datalistMap
      }
   
 
      return [data,sourceMapWithMeta];
    }

    // TODO: add it to the data and change the structure.
    public getFlatData(datalist: VisualDataPoint[],sourceMap: SourceMapWithMeta): [SourceMapWithMeta,VisualDataPointMap]{

      let { sources, grouped,meta} = sourceMap;
      let {currentDate,ranges} = meta
    
      let datalistMap: VisualDataPointMap = {};

      let nestedData = ['duration']

      function mapper(datalist:VisualDataPoint){
       
        Object.entries(datalist).map(datapoint => {

          if (nestedData.includes(datapoint[0])){
            return mapper(datapoint[1]);
          }
          else{
            if (!datalistMap[datapoint[0]]){
                datalistMap[datapoint[0]] = [datapoint[1]]
            }
            else{
              datalistMap[datapoint[0]].push(datapoint[1]);
            }
        }

        });
      }
  
      // how to dynamically generate the array i need to intialize it if not dynamic generted then undefined array
   
      datalist.forEach(mapper);

      let rangeMap:RangeMap = {
        startMarker: [Math.min(...datalistMap.startMarker), Math.max(...datalistMap.startMarker)],
        startTime: [Math.min(...datalistMap.startTime), Math.max(...datalistMap.startTime)],
        endMarker: [Math.min(...datalistMap.endMarker), Math.max(...datalistMap.endMarker)],
        endTime: [Math.min(...datalistMap.endTime), Math.max(...datalistMap.endTime)],
        historical: [Math.min(...datalistMap.startDuration), Math.max(...datalistMap.startDuration)],
        predictive: [Math.min(...datalistMap.endDuration), Math.max(...datalistMap.endDuration)],
        size: [Math.min(...datalistMap.size), Math.max(...datalistMap.size)],
        total: [Math.min(...datalistMap.totalDuration), Math.max(...datalistMap.totalDuration)]
      }
       

      meta = {
        currentDate: currentDate,
        ranges: rangeMap
      }

      sourceMap = {
        sources, grouped, meta
      }

      return [sourceMap,datalistMap];
      
    }


    // public createDataPoint(sourceMap: SourceMapWithMeta):VisualDataPoint{

    //   return null
    // }
    public transform(dataView: DataView): ViewModel | undefined{
      let sourceMapRaw: SourceMapWithMeta | undefined = this.getSourceMapWithMeta(dataView);
      if(isUndefined(sourceMapRaw)) return undefined;
      let sourceMap: SourceMapWithMeta = this.renameSourceMap(sourceMapRaw);


      let data: [VisualData, SourceMapWithMeta] = this.transformDataPoints(sourceMap);
      //sourceMapFilter = getFlatData(data) and then sourceMap = getMetaData(sourceMapFilter)
      // TODO: function name is different from the functionality
     
      return {sourceMap: data[1], data: data[0]};
    }

    public getCurrentDate(sources: SourceMap): Date{
      let hasCurrentDate = sources.currentDate !== undefined && (<any>sources.currentDate) !== false
      let currentDate: Date
      if (hasCurrentDate) {
        let rawValue: PrimitiveValue = sources.currentDate.values.find(isSet)
        if (rawValue instanceof Date) {
          currentDate = rawValue
        } else {
          currentDate = new Date(currentDate)
        }
      } else {
        currentDate = new Date()
      }
      // let hours12 = (1000 * 60 * 60 * 12)
      currentDate = new Date('Jan 22, 2019');
      return currentDate
    }
  }
}
