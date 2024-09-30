import dynamic from 'next/dynamic'

export const DynamicImport = (
  namedImport: string,
  importExp: () => Promise<any>,
) =>
  dynamic(() => {
    if (namedImport.length > 0) {
      return importExp().then(mod => mod[namedImport])
    }

    return importExp()
  })
