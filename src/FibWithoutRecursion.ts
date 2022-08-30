import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
} from 'snarkyjs';

export class FibWithoutRecursion extends SmartContract {
  @state(Field) nthMinus1 = State<Field>();
  @state(Field) nthMinus2 = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    this.nthMinus2.set(Field.zero);
    this.nthMinus1.set(Field.one);
  }

  @method update(n: Field) {
    const currentNthMinus2 = this.nthMinus2.get();
    this.nthMinus2.assertEquals(currentNthMinus2);

    const currentNthMinus1 = this.nthMinus1.get();
    this.nthMinus1.assertEquals(currentNthMinus1);

    const newState = currentNthMinus2.add(currentNthMinus1);
    newState.assertEquals(n);

    this.nthMinus2.set(currentNthMinus1);
    this.nthMinus1.set(newState);
  }
}
