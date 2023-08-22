export default function RandomNames () {
  const names = [
    'Was it the boss?',
    'It could have been Fede...',
    'I bet this one was sent straight from the database',
    'I was scared and preferred to remain anonymous',
    'I am not sure if I should say this, but...',
    'Zzzz...',
    'It was the spell checker...',
    'My cat jumped on the keyboard, sorry...',
    'lo cagamos...',
    'tuk tuk tuk'
  ]

  return names[Math.floor(Math.random() * names.length)]
}