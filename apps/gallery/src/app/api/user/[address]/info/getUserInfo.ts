import { publicClient } from "@/app/publicClient";
import { DEFAULT_PROFILE_PICTURE } from "@/constants/config";
import { UserSchema } from "@/db/schema/UserSchema";
import { UserInfo } from "@/types/user";
import { shortAddress } from "@/utils/address/format";
import { database } from "@/utils/database/db";

export const getUserInfo = async (
  address: `0x${string}`
): Promise<UserInfo> => {
  const [dbUser, ensName] = await Promise.all([
    database
      .collection<UserSchema>("users")
      .findOne(
        { _id: address },
        {
          projection: {
            twitter: true,
            farcaster: true,
            userName: true,
            about: true,
            profilePic: true,
          },
        }
      )
      .then((user) =>
        user
          ? {
              address: user?._id,
              about: user?.about,
              profilePic: user?.profilePic,
              twitter: user?.twitter,
              farcaster: user?.farcaster,
              userName: user?.userName,
            }
          : { address }
      ),
    publicClient.getEnsName({ address }),
  ]);

  const ensAvatar = ensName
    ? await publicClient.getEnsAvatar({ name: ensName })
    : undefined;

  const userName =
    dbUser?.userName?.toLowerCase() || ensName || shortAddress(address);
  const profilePic = dbUser?.profilePic ?? ensAvatar ?? DEFAULT_PROFILE_PICTURE;

  return { ...dbUser, userName, profilePic };
};
