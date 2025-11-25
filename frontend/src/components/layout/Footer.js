import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Jafaruttayyar Dahodwala. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
