export class PushArray extends Array {

    count = 1;
    splice(start, deleteCount, replace) {
        let myCountbefore = this.count;
        let ret;
        if (typeof replace === "undefined") {
            ret = super.splice(start, deleteCount);
        } else {
            // ret = super.splice(start, deleteCount, replace);
            throw new Error("not implemented")
        }

        ret.count = 1;
        ret.parent = null;
        for (let item of ret) {
            if (Array.isArray(item)) {
                if (item.count == null) {
                    throw new Error("should be push array");
                }
                ret.count += item.count;
                item.parent = ret;
            } else {
                ret.count++;
            }
        }
        this.count = myCountbefore - (ret.count - 1);
        return ret;
    }
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