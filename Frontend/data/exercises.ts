import type { GuidedExercise } from '../types';

export const exercises: GuidedExercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    category: 'Breathing',
    description: 'A simple technique to calm your nervous system and reduce stress by visualizing a box as you breathe.',
    steps: [
      { title: 'Breathe In', instruction: 'Slowly inhale through your nose for 4 seconds.', duration: 4 },
      { title: 'Hold', instruction: 'Hold your breath for 4 seconds.', duration: 4 },
      { title: 'Breathe Out', instruction: 'Slowly exhale through your mouth for 4 seconds.', duration: 4 },
      { title: 'Hold', instruction: 'Hold your breath for 4 seconds before the next cycle.', duration: 4 },
    ],
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    category: 'Mindfulness',
    description: 'A mindfulness exercise that helps you connect with the present moment by engaging all five senses.',
    steps: [
      { title: 'See', instruction: 'Acknowledge 5 things you can see around you. Notice their color, shape, and texture.', duration: 30 },
      { title: 'Feel', instruction: 'Become aware of 4 things you can feel. The pressure of your feet on the floor, the texture of your clothes.', duration: 30 },
      { title: 'Hear', instruction: 'Listen for 3 things you can hear. The hum of a fan, birds outside, your own breathing.', duration: 30 },
      { title: 'Smell', instruction: 'Notice 2 things you can smell. The scent of coffee, the air, a nearby flower.', duration: 30 },
      { title: 'Taste', instruction: 'Focus on 1 thing you can taste. The lingering taste of your last meal, or simply the taste of your own mouth.', duration: 30 },
    ],
  },
  {
    id: 'body-scan-meditation',
    title: 'Body Scan Meditation',
    category: 'Meditation',
    description: 'A guided meditation to build awareness of your body, release tension, and cultivate mindfulness.',
    steps: [
      { title: 'Get Comfortable', instruction: 'Find a comfortable position, either sitting or lying down. Close your eyes and take a few deep breaths.', duration: 20 },
      { title: 'Focus on Feet', instruction: 'Bring your attention to the toes of your left foot. Notice any sensations without judgment. Wiggle them gently.', duration: 25 },
      { title: 'Scan Left Leg', instruction: 'Slowly move your awareness up your left leg, through your ankle, calf, and thigh. Notice any tension and let it go.', duration: 25 },
      { title: 'Focus on Right Foot & Leg', instruction: 'Now, bring your attention to your right foot and slowly scan up through your right leg, releasing tension.', duration: 30 },
      { title: 'Scan Torso', instruction: 'Move your focus to your hips, stomach, and chest. Notice the gentle rise and fall of your breath.', duration: 30 },
      { title: 'Scan Arms & Hands', instruction: 'Become aware of your arms, from your shoulders down to your fingertips. Let them feel heavy and relaxed.', duration: 30 },
      { title: 'Scan Neck & Head', instruction: 'Bring your awareness to your neck, face, and scalp. Release any tension in your jaw and forehead.', duration: 30 },
      { title: 'Rest in Awareness', instruction: 'Feel your entire body, breathing gently. Rest in this state of awareness for a few moments.', duration: 40 },
    ],
  },
];