import {mapState} from "vuex";


export default {
    methods: {
        hasPermission(type) {
            return type.includes(this.permission);
        }
    },
    computed: {
        ...mapState({
            permission: state => state.server.permission,
        })
    }
}