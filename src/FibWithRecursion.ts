import {
  Field,
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  SelfProof,
  ZkProgram,
  Proof,
  isReady,
} from 'snarkyjs';

await isReady;

let FibonacciSequence = ZkProgram({
  publicInput: Field,

  methods: {
    // those are our base cases that we start with - defined as:
    // fib_0 = 0
    // fib_1 = 1
    // we need a proof associated with the base cases so we can recursively verify their correctness
    fib0: {
      privateInputs: [],

      method(fib: Field) {
        fib.assertEquals(Field.zero);
      },
    },
    fib1: {
      privateInputs: [],

      method(fib: Field) {
        fib.assertEquals(Field.one);
      },
    },

    inductiveFib: {
      privateInputs: [SelfProof, SelfProof],

      method(fib: Field, fib1: SelfProof<Field>, fib2: SelfProof<Field>) {
        fib1.verify();
        fib2.verify();
        let newFib = fib1.publicInput.add(fib2.publicInput);
        fib.assertEquals(newFib);
      },
    },
  },
});

class FibWithRecursionProof extends Proof<Field> {
  static publicInputType = Field;
  static tag = () => FibonacciSequence;
}

class FibWithRecursion extends SmartContract {
  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method verify(
    proof: FibWithRecursionProof // <-- we're passing in a proof!
  ) {
    proof.verify();
  }
}

// proving: generating proof by doing the actual computation
async function fibProof(N = 10) {
  let fib_n_2 = await FibonacciSequence.fib0(Field.zero);
  let fib_n_1 = await FibonacciSequence.fib1(Field.one);

  let fib_n: Proof<Field> | undefined = undefined;
  for (let n = 2; n <= N; n++) {
    console.log(`working on fib_${n}...`);
    let publicInput: Field = fib_n_1.publicInput.add(fib_n_2.publicInput);
    fib_n = await FibonacciSequence.inductiveFib(publicInput, fib_n_1, fib_n_2);

    fib_n_2 = fib_n_1;
    fib_n_1 = fib_n;

    console.log(`got fib_${n} = ${fib_n.publicInput.toString()}`);
  }
  return fib_n;
}

export { FibWithRecursion, FibonacciSequence, fibProof };
