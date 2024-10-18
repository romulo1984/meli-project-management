const transformItemsInText = (items: string[]) => {
  return items.map((item, index) => `${index + 1} - ${item}`).join('\n')
}

const transformTextInItems = (text: string) => {
  return text
    .split(';')
    .map(item => item.trim())
    .filter(item => item !== '')
}

export { transformItemsInText, transformTextInItems }
