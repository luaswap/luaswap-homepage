import { createMuiTheme } from '@material-ui/core'
import MyColors from './colors'

const MyTheme = createMuiTheme({
  color: MyColors,
  typography: {
    fontFamily: ['Nunito Sans', 'sans-serif'].join(','),
  },
})

export default MyTheme
