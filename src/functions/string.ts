import { DataType, FunctionDefinition } from '../interfaces-private';

export const stringFunctions: FunctionDefinition[] = [
    {
        name: 'lower',
        args: [DataType.text],
        returns: DataType.text,
        implementation: (x: string) => x?.toLowerCase(),
    },
    {
        name: 'upper',
        args: [DataType.text],
        returns: DataType.text,
        implementation: (x: string) => x?.toUpperCase(),
    },
    {
        name: 'concat',
        args: [DataType.text],
        argsVariadic: DataType.text,
        returns: DataType.text,
        implementation: (...x: string[]) => x?.join(''),
    },
]