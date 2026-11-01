// All copy for the Approach page lives here so it's easy to edit in one place.
//
// `finish` (0-3) is how "finished" that stage's note looks: a dashed draft outline
// at the start that firms up into a solid, filled note by the last stage.
// `text` / `note` are the desktop grid placements, which shift from stage to stage.

export const OPENING = {
  label: 'Approach',
  title: 'I like figuring things out.',
  lead: 'I enjoy building things that work well and feel right to use. Sometimes that means finding a better way to structure a component. Other times, it means spending an unreasonable amount of time getting an animation to feel just right.',
  titleMark: 'figuring things out',
  aside: "I don't always get it right the first time. I learn by building, testing, breaking things, and working through the details until they make sense.",
};

export const CHAPTERS = [
  {
    n: '01',
    mark: 'needs to be solved',
    name: 'Understand before building',
    statement: 'First, figure out what actually needs to be solved.',
    body: [
      'Before writing code, I try to understand the problem, the people using the product, and what the finished experience should feel like. Having a clearer idea of the goal makes it easier to decide what matters and what doesn’t.',
    ],
    items: [
      'Breaking larger problems into smaller, manageable parts.',
      'Identifying essential functionality before adding unnecessary extras.',
      'Considering how the experience should work across different screen sizes.',
    ],
    finish: 0,
    text: 'lg:col-start-1 lg:col-span-7',
    note: 'lg:col-start-9 lg:col-span-4 lg:mt-28',
  },
  {
    n: '02',
    mark: 'make it better',
    name: 'Build with intention',
    statement: 'Make it work. Make it clear. Then make it better.',
    body: [
      'I care about how things are built, not just how they look on the screen. I try to keep components understandable, responsibilities well-defined, and code easy to revisit when something needs to change.',
      'The first implementation isn’t always the best one. Sometimes finding the simplest and most maintainable solution takes a little more thought.',
    ],
    items: [
      'Building reusable components when they genuinely make sense.',
      'Keeping layout, logic, and styling organised.',
      'Choosing practical, maintainable solutions instead of simply taking the quickest route.',
    ],
    finish: 1,
    text: 'lg:col-start-5 lg:col-span-8',
    note: 'lg:col-start-1 lg:col-span-4 lg:mt-36',
  },
  {
    n: '03',
    mark: 'it’s finished',
    name: 'Test beyond the happy path',
    statement: 'If it works once, that doesn’t mean it’s finished.',
    body: [
      'A page can look great on one screen and fall apart on another. An animation can technically work but still feel awkward. I try to look beyond the ideal scenario and pay attention to how the experience behaves in practice.',
    ],
    items: [
      'Checking layouts across different viewport sizes.',
      'Testing interactions, transitions, and relevant edge cases.',
      'Investigating unexpected behaviour instead of assuming everything works as intended.',
    ],
    finish: 2,
    text: 'lg:col-start-2 lg:col-span-7',
    note: 'lg:col-start-9 lg:col-span-4 lg:mt-20',
  },
  {
    n: '04',
    mark: 'the whole thing feels',
    name: 'Refine the details',
    statement: 'Small details change how the whole thing feels.',
    body: [
      'Spacing, timing, alignment, and transitions can seem insignificant when considered individually. Together, they shape the experience. I enjoy revisiting those details, comparing the implementation with what I originally intended, and making adjustments where they matter.',
    ],
    items: [
      'Fine-tuning animation timing and easing.',
      'Correcting inconsistencies in spacing and sizing.',
      'Making interactions feel deliberate rather than accidental.',
    ],
    finish: 3,
    text: 'lg:col-start-4 lg:col-span-7',
    note: 'lg:col-start-1 lg:col-span-3 lg:mt-40',
  },
];

export const CLOSING = {
  lines: ['Still learning.', 'Always building.'],
  body: [
  'I don’t think there’s one perfect way to build something. Every project brings different problems and opportunities to understand things better.',
  'I’m still figuring things out, and that keeps me interested in building.',
],
  invite: 'Have something interesting to build?',
  action: 'Let’s talk.',
};
