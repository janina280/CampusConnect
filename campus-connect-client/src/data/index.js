import {ChatCircleDots, Gear, SignOut, User, Users,} from "phosphor-react";

const Profile_Menu = [
  {
    title: "Profile",
    icon: <User />,
    path: "/profile",
  },
  {
    title: "Settings",
    icon: <Gear />,
    path: "/settings",
    adminOnly: true,
  },
  {
    title: "LogOut",
    icon: <SignOut />,
    action: "logout",
  },
];


const Nav_Buttons = [
  {
    index: 0,
    icon: <ChatCircleDots />,
  },
  {
    index: 1,
    icon: <Users />,
  },
];


export {
  Profile_Menu,
  Nav_Buttons,
};
