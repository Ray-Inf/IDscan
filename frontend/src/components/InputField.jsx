
// import React from 'react';

// const InputField = ({ label, type = 'text', name, defaultValue, error, hidden, inputProps }) => {
//     return (
//         <div className={hidden ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/4'}>
//             <label className="text-xs text-gray-500">{label}</label>
//             <input
//                 type={type}
//                 name={name}
//                 className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//                 {...inputProps}
//                 defaultValue={defaultValue}
//             />
//             {error?.message && (
//                 <p className="text-xs text-red-400">{error.message.toString()}</p>
//             )}
//         </div>
//     );
// };

// export default InputField;
import React from 'react';

const InputField = ({ label, type = 'text', name, defaultValue = "", error, hidden, inputProps = {} }) => {
    return (
        <div className={hidden ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/4'}>
            <label className="text-xs text-gray-500">{label}</label>
            <input
                type={type}
                name={name}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                defaultValue={defaultValue}
                {...inputProps}
            />
            {error?.message && (
                <p className="text-xs text-red-400">{error.message.toString()}</p>
            )}
        </div>
    );
};

export default InputField;