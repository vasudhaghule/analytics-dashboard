'use client';

import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRouter, usePathname } from 'next/navigation';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const menuItems = [
  { text: 'Weather', icon: <WbSunnyIcon />, path: '/weather' },
  { text: 'News', icon: <ArticleIcon />, path: '/news' },
  { text: 'Finance', icon: <TrendingUpIcon />, path: '/finance' },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box>
      <StyledToolbar>
        <Box sx={{ flexGrow: 1 }} />
      </StyledToolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => router.push(item.path)}
            selected={pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar; 