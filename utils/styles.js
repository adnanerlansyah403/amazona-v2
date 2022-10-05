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
        maxWidth: 800,
        margin: '0 auto',
    },
    navbarButton: {
        color: '#fff',
        textTransform: 'initial',
    },
    transparentBackground: {
        backgroundColor: 'transparent',
    }
});

export default useStyles;