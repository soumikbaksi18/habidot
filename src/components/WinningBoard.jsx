import Item from "../components/User";
import board from "../assets/images/lb.png";
import dare from "../assets/images/dare.png";
import { styled } from "nativewind";
import back from "../assets/images/back.png";
import nvn from "../assets/images/nvn.png";
import avat from "../assets/images/avatar1.png";
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { useState } from "react";

const WinningBoard = ({ game, leaderboard }) => {
  const StyledScrollView = styled(ScrollView);
  const StyledView = styled(View);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const [type, setType] = useState("1v1");
  const [tab, setTab] = useState(0);

  return (
    <>
      <StyledView className="h-[50%] w-full relative flex items-center ">
        <Image
          source={game === "1v1" ? dare : game === "0v1" ? board : nvn} // Fixed the conditional rendering of the image
          className="absolute bottom-[0px]"
        />
        {game === "nvn" && (
          <>
            {leaderboard.length >= 2 &&
              leaderboard[1]?.Player?.User?.ProfilePicture && (
                <Image
                  source={{ uri: leaderboard[1].Player.User.ProfilePicture }}
                  className="absolute bottom-[185px] left-[25%] h-[56px] w-[56px] rounded-full"
                />
              )}
            {leaderboard.length >= 1 &&
              leaderboard[0]?.Player?.User?.ProfilePicture && (
                <Image
                  source={{ uri: leaderboard[0].Player.User.ProfilePicture }}
                  className="absolute bottom-[220px] left-[44%] h-[56px] w-[56px] rounded-full"
                />
              )}
            {leaderboard.length >= 3 &&
              leaderboard[2]?.Player?.User?.ProfilePicture && (
                <Image
                  source={{ uri: leaderboard[2].Player.User.ProfilePicture }}
                  className="absolute bottom-[185px] right-[25%] h-[56px] w-[56px] rounded-full"
                />
              )}
          </>
        )}

        {game === "1v1" && (
          <>
            {leaderboard.length >= 1 &&
              leaderboard[0]?.Player?.User?.ProfilePicture && (
                <Image
                  source={{ uri: leaderboard[0].Player.User.ProfilePicture }}
                  className="absolute bottom-[185px] left-[25%] h-[56px] w-[56px] rounded-full"
                />
              )}
            {leaderboard.length >= 2 &&
              leaderboard[1]?.Player?.User?.ProfilePicture && (
                <Image
                  source={{ uri: leaderboard[1].Player.User.ProfilePicture }}
                  className="absolute bottom-[185px] right-[25%] h-[56px] w-[56px] rounded-full"
                />
              )}
          </>
        )}
        {game === "0v1" && leaderboard[0]?.Player?.User?.ProfilePicture && (
          <Image
            source={{ uri: leaderboard[0].Player.User.ProfilePicture }}
            className="absolute bottom-[220px] right-[42%] h-[66px] w-[66px] rounded-full"
          />
        )}
      </StyledView>
      <StyledScrollView className="h-[35%] w-full bg-white rounded-t-3xl pt-[10px]">
        {leaderboard.length > 0 ? (
          leaderboard.map((item, index) => (
            <Item
              key={index}
              item={item}
              image={
                item.Player?.User?.ProfilePicture
                  ? { uri: item.Player.User.ProfilePicture }
                  : avat // Ensure avat is valid local import.
              }
            />
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No player has joined yet
          </Text>
        )}
      </StyledScrollView>
    </>
  );
};

export default WinningBoard;
