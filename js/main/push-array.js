export class PushArray extends Array {

    count = 1;
    pop(){
        if (this.length === 0) {
            return undefined;
        }
        let retval = super.pop();

        let subtracted = 0;
        if (Array.isArray(retval)) {
            if (retval.count) {
                subtracted = retval.count;
                retval.parent = null;
            } else {
                throw new Error("must be pusharray");
                // this.count -= (retval.length + 1);
            }
        } else {
            subtracted = 1;
        }
        this.count -= subtracted;

        let myParent = this.parent;
        while (myParent != null) {
            myParent.count -= subtracted;
            myParent = myParent.parent;
        }

        if ( this.count < 1) {
            debugger;
            throw new Error("invalid state");
        }
        return retval;
    }

    push(val){
        let added = 0;
        if (Array.isArray(val)) {
            if (val.count) {
                added = val.count;
                val.parent = this;
            } else {
                throw new Error("must be pusharray");
                // this.count += (val.length + 1);
            }
        } else {
            added = 1;
        }

        this.count += added;

        let myParent = this.parent;
        while (myParent != null) {
            myParent.count += added;
            myParent = myParent.parent;
        }

        super.push(val);
    }
}