/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
     "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#FF574A' }, // Choose your flashing color here
        },
        shake: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out 3', // Duration for the shake animation
        flash: 'flash 1s linear 3',
      },
      animationDelay: {
        '0': '0s',
        '500': '0.5s',
        '1': '1s',
        '2': '2s',
        // Add more delays if needed
      },
      screens: {
        'max-1400': { max: '1400px' },
      },
      height: {
        'calc-full-minus-50': 'calc(100% - 50px)',
        'calc-vh-minus-50': 'calc(100vh - 50px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#4c5eeb',
        secondary: '#6c757d',
        success: '#1bac58',
        info: '#815bc8',
        warning: '#ff9d00',
        danger: '#FF574A',
        light: '#f8f9fa',
        dark: '#343a40',
        Medium_Ruby: '#A53860',
        bg_body: '#E5E9ECDB',
        bg_body_dark: '#060818',
        trainSelected: '#d3d3d3', //  dark color	$dark: #323A46; //  dark color
        dark_trainSelected: '#30384a',

        special: '#8e0120',
        rajdhani: '#d481fa',
        'special-tatkal': '#c8d600',
        'garib-rath': '#a7fbd0',
        'jan-shatabdi': '#008DD2',
        shatabdi: '#2570fa',
        duronto: '#EFC050',
        others: '#CCCCCC',

        // primary: {
        //   DEFAULT: '#4361ee',
        //   light: '#eaf1ff',
        //   'dark-light': 'rgba(67,97,238,.15)',
        // },

        // secondary: {
        //     DEFAULT: '#805dca',
        //     light: '#ebe4f7',
        //     'dark-light': 'rgb(128 93 202 / 15%)',
        // },

        // success: {
        //     DEFAULT: '#00ab55',
        //     light: '#ddf5f0',
        //     'dark-light': 'rgba(0,171,85,.15)',
        // },

        // danger: {
        //     DEFAULT: '#e7515a',
        //     light: '#fff5f5',
        //     'dark-light': 'rgba(231,81,90,.15)',
        // },

        // warning: {
        //     DEFAULT: '#e2a03f',
        //     light: '#fff9ed',
        //     'dark-light': 'rgba(226,160,63,.15)',
        // },

        // info: {
        //     DEFAULT: '#2196f3',
        //     light: '#e7f7ff',
        //     'dark-light': 'rgba(33,150,243,.15)',
        // },

        // dark: {
        //     DEFAULT: '#3b3f5c',
        //     light: '#eaeaec',
        //     'dark-light': 'rgba(59,63,92,.15)',
        // },

        // black: {
        //     DEFAULT: '#0e1726',
        //     light: '#e3e4eb',
        //     'dark-light': 'rgba(14,23,38,.15)',
        // },

        // white: {
        //     DEFAULT: '#ffffff',
        //     light: '#e0e6ed',
        //     dark: '#888ea8',
        // },
      },
      // You can also extend your theme to include custom dark mode styles
    },
  },
  plugins: [],
};
