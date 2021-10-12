export default function capitalize(sentence) {
  return sentence
    .toLocaleLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(' ')
}
