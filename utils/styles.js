import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
    navbar: {
        backgroundColor: '#203040',
        '& a': {
            color: '#fff',
            marginLeft: 10,
        },
    },
    brand: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
    },
    grow: {
        flexGrow: 1,
    },
    main: {
        minHeight: '80vh',
    },
    footer: {
        marginBlock: 10,
        textAlign: 'center',
    },
    section: {
        marginBlock: '10px',
    },
    form: {
        width: "100%",
        maxWidth: 800,
        margin: '0 auto',
    },
    navbarButton: {
        color: '#fff',
        textTransform: 'initial',
    },
    transparentBackground: {
        backgroundColor: 'transparent',
    },
    paddingNone: {
        padding: 0,
    },
    boxShadowNone: {
        boxShadow: 'none'
    },
    error: {
        color: '#f04040',
    },
    fullWidth: {
        width: '100%',
    },
    marginTopContainer: {
        marginTop: '.5rem',
    },
    reviewForm: {
        maxWidth: 800,
        width: '100%',
    },
    reviewItem: {
        marginRight: '1rem',
        borderRight: '1px solid #808080',
        paddingRight: '1rem',
    },
    toolbar: {
        justifyContent: "space-between",
    },  
    menuButton: { padding: 0 },
    mt1: { marginTop: '1rem' },
    searchSection: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    searchForm: {
        border: '1px solid #fff',
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    searchInput: {
        paddingLeft: 5,
        color: '#000',
        '& ::placeholder': {
            color: '#606060',
        },
    },
    iconButton: {
      backgroundColor: '#f8c040',
      padding: 5,
      borderRadius: '0 5px 5px 0',  
      '& span': {
        color: '#000',
      },
    },
    sort: {
        marginRight: 5,
    },
}));

export default useStyles;