// const colors = [
//     'bg-red-100 text-red-500 border-red-800/20',
//     'bg-blue-100 text-blue-500 border-blue-800/20',
//     'bg-yellow-100 text-yellow-500 border-yellow-800/20',
//     'bg-green-100 text-green-500 border-green-800/20',
//     'bg-pink-100 text-pink-500 border-pink-800/20',
//     'bg-indigo-100 text-indigo-500 border-indigo-800/20',
//     'bg-orange-100 text-orange-500 border-orange-800/20',
//   ];

// const colors = [
//   'bg-orange-100 text-orange-500 border border-orange-300',
//   'bg-gray-100 text-gray-500 border border-gray-300',
// ];

const colors = [
  'bg-orange-100 text-orange-600',
  'bg-gray-100 text-gray-500',
];
  
let colorIndex = 0;

export function getNextColor() {
  const color = colors[colorIndex];
  colorIndex = (colorIndex + 1) % colors.length;
  return color;
}