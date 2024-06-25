import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';

export const ActionCard = (props) => {
  const { style ,url, title, descriptions } = props;

  return (
    <Card sx={{ width: 300, margin: '16px',color:style }} >
      <CardActionArea href={url}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descriptions}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
