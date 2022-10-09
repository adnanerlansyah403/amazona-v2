import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles({
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
});

export default useStyles;