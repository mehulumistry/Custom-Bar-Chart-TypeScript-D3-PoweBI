module powerbi.extensibility.visual {
    export function isSet(value: any) : boolean {
        return !isUndefined(value) && !isNull(value)
    }

    export function isEverySet(...values: any[]) : boolean {
        return values.every(isSet)
    }
    
    export function isAnySet(...values: any[]) : boolean {
        return values.some(isSet)
    }
    // Typeguards
    export function isUndefined(value:any):value is undefined{
        return typeof value === 'undefined' || value === undefined
    }
    
    export function isNull(value:any):value is null{
        return value === null
    }
    export const isDate = (value: any): value is Date => value instanceof Date;
    export const castToDate = (value: PrimitiveValue) => isDate(value) || !isSet(value) ? value : new Date(value as any)
    export function isDataViewValid(value: DataView){
        return isUndefined(value.categorical) || isUndefined(value.categorical.categories) || isUndefined(value.categorical.values);
    }

    export const isNumber = (value: any): value is number => typeof value === "number";
    export const castToNumber = (value: string) => isNumber(value) || !isSet(value) ? value : parseInt(value);

    export function isDataViewColumn(value: any): value is DataViewColumn {
        let asDataViewColumn:DataViewColumn = value;
        return isEverySet(
            asDataViewColumn.source,
            asDataViewColumn.values
        )
    }
    
    export function isDataViewValueColumn(value:any): value is DataViewValueColumn {
        let asDataViewCategoricalColumn:DataViewValueColumn = value;
        return isDataViewColumn(asDataViewCategoricalColumn) 
            && asDataViewCategoricalColumn.source.isMeasure === true
    }

    export function isDataViewCategoryColumn(value:any): value is DataViewCategoryColumn {
        let asDataViewValueColumn:DataViewValueColumn = value;
        return isDataViewColumn(asDataViewValueColumn) 
            && asDataViewValueColumn.source.isMeasure !== true
    }

    

    export function isVisualDataPoint(value:any): value is VisualDataPoint {
        let isVisualDataPoint: VisualDataPoint = value;
        return isEverySet(
            isVisualDataPoint.id,
            //isVisualDataPoint.
        );
    }

}

