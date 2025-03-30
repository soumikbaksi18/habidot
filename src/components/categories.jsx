import Run from "../assets/create-challenge/run.png";
import Travel from "../assets/create-challenge/Travel.webp";
import Art from "../assets/create-challenge/Art.webp";
import Adventure from "../assets/create-challenge/Adventure.webp";
import Lifestyle from "../assets/create-challenge/Lifestyle.webp";
import Events from "../assets/create-challenge/Events.webp";
import Sports from "../assets/create-challenge/Sports.webp";
import SocialMedia from "../assets/create-challenge/SocialMedia.webp";
import Random from "../assets/create-challenge/random.webp";
import Games from "../assets/create-challenge/Gaming.webp";
export const categories = [
  {
    name: "Fitness",
    id: 1,
    image: Run,
    gameType: "0",
    description: "Challenge yourself to run and improve your stamina.",
  },
  {
    name: "Travel",
    id: 2,
    image: Travel,
    // gameType: "1",
    description: "Take on walking challenges to stay fit and active.",
  },
  {
    name: "Art",
    id: 3,
    image: Art,
    // gameType: "4",
    description: "Capture stunning photos and get votes from others.",
  },
  {
    name: "Adventure",
    id: 4,
    image: Adventure,
    // gameType: "4",
    description: "Show your drawing skills and compete for votes.",
  },
  {
    name: "Lifestyle",
    id: 5,
    image: Lifestyle,
    // gameType: "3",
    description: "Record your singing and receive votes.",
  },
  {
    name: "Gaming",
    id: 6,
    image: Games,
    // gameType: "3",
    description: "Cook delicious meals and get votes for your dishes.",
  },
  {
    name: "Sports",
    id: 7,
    image: Sports,
    // gameType: "3",
    defaultDescription: "Cook delicious meals and get votes for your dishes.",
  },
  {
    name: "Social Media",
    id: 8,
    image: SocialMedia,
    // gameType: "3",
    description: "Cook delicious meals and get votes for your dishes.",
  },
  {
    name: "Event",
    id: 9,
    image: Events,
    // gameType: "3",
    description: "Cook delicious meals and get votes for your dishes.",
  },
  {
    name: "Random",
    id: 10,
    image: Random,
    // gameType: "3",
    description: "Cook delicious meals and get votes for your dishes.",
  },
];

export const categoryImageMap = {
  1: Run,
  2: Travel,
  3: Art,
  4: Adventure,
  5: Lifestyle,
  6: Games,
  7: Sports,
  8: SocialMedia,
  9: Events,
  10: Random,
};

export const getCategoryIcon = (categoryId) => {
  console.log("Category ID received:", categoryId);
  const icon = categoryImageMap[categoryId] || null;
  console.log("Category icon returned:", icon);
  return icon;
};
